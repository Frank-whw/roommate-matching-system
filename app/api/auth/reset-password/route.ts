import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, generateResetToken, verifyResetToken } from '@/lib/auth/session';
import { logActivity, generateEmailFromStudentId } from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';
import { sendPasswordResetEmail } from '@/lib/email';

// 发送重置密码邮件的schema
const sendResetEmailSchema = z.object({
  studentId: z.string().min(1, '学号不能为空').regex(/^102\d{7}$/, '学号格式不正确'),
});

// 重置密码的schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, '重置令牌不能为空'),
  password: z.string()
    .min(8, '密码至少需要8个字符')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/\d/, '密码必须包含至少一个数字'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 发送重置密码邮件
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = sendResetEmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { studentId } = result.data;

    // 查找用户
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.studentId, studentId))
      .limit(1);

    if (foundUsers.length === 0) {
      return NextResponse.json(
        { error: '该学号未注册' },
        { status: 404 }
      );
    }

    const user = foundUsers[0];

    if (!user.isActive) {
      return NextResponse.json(
        { error: '账户已被禁用' },
        { status: 400 }
      );
    }

    // 生成重置令牌
    const resetToken = await generateResetToken(user.studentId);
    if (!resetToken) {
      return NextResponse.json(
        { error: '生成重置令牌失败' },
        { status: 500 }
      );
    }

    // 更新用户的密码重置令牌
    await db
      .update(users)
      .set({
        passwordResetToken: resetToken.token,
        passwordResetExpires: resetToken.expires,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // 发送重置密码邮件
    try {
      const userEmail = generateEmailFromStudentId(user.studentId);
      await sendPasswordResetEmail(
        userEmail,
        user.name || userEmail,
        resetToken.token
      );
    } catch (emailError) {
      console.error('发送重置密码邮件失败:', emailError);
      return NextResponse.json(
        { error: '邮件发送失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 记录活动日志
    await logActivity(user.id, ActivityType.UPDATE_PASSWORD);

    return NextResponse.json({
      success: true,
      message: '重置密码邮件已发送，请检查您的邮箱',
    });

  } catch (error) {
    console.error('发送重置密码邮件失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 重置密码
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // 验证重置令牌
    const tokenData = await verifyResetToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: '重置密码链接无效或已过期，请重新申请' },
        { status: 400 }
      );
    }

    // 查找用户
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.studentId, tokenData.studentId))
      .limit(1);

    if (foundUsers.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const user = foundUsers[0];

    // 检查学号是否匹配
    if (user.studentId !== tokenData.studentId) {
      return NextResponse.json(
        { error: '验证信息不匹配' },
        { status: 400 }
      );
    }

    // 哈希新密码
    const passwordHash = await hashPassword(password);

    // 更新用户密码并清除重置令牌
    await db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    // 记录活动日志
    await logActivity(user.id, ActivityType.UPDATE_PASSWORD);

    return NextResponse.json({
      success: true,
      message: '密码重置成功！您现在可以使用新密码登录了。',
    });

  } catch (error) {
    console.error('重置密码失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
