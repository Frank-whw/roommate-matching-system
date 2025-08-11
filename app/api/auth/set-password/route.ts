import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users, userProfiles, ActivityType } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPasswordSetupToken } from '@/lib/auth/session';
import { logActivity, generateEmailFromStudentId } from '@/lib/db/queries';

// 设置密码请求schema
const setPasswordSchema = z.object({
  token: z.string().min(1, '令牌不能为空'),
  name: z.string().min(1, '用户名不能为空').max(50, '用户名不能超过50个字符'),
  gender: z.enum(['male', 'female'], { errorMap: () => ({ message: '请选择有效的性别' }) }),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = setPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, name, gender, password } = result.data;

    // 验证JWT令牌
    const tokenData = await verifyPasswordSetupToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: '设置密码链接无效或已过期，请重新申请' },
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

    // 检查用户是否已经设置过密码
    if (user.passwordHash && user.isActive) {
      return NextResponse.json(
        { error: '密码已设置，请直接登录' },
        { status: 400 }
      );
    }

    // 哈希新密码
    const passwordHash = await hashPassword(password);

    // 使用事务同时更新用户信息和创建用户资料
    const transactionResult = await db.transaction(async (tx) => {
      // 更新用户信息：设置密码、姓名、激活账户、验证邮箱
      const updatedUser = await tx
        .update(users)
        .set({
          name: name.trim(),
          passwordHash,
          isActive: true,
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id))
        .returning();

      if (updatedUser.length === 0) {
        throw new Error('用户更新失败');
      }

      // 创建用户资料
      const createdProfile = await tx
        .insert(userProfiles)
        .values({
          userId: user.id,
          gender: gender as 'male' | 'female',
          isProfileComplete: false
        })
        .returning();

      if (createdProfile.length === 0) {
        throw new Error('用户资料创建失败');
      }

      return { user: updatedUser[0], profile: createdProfile[0] };
    });

    if (!transactionResult) {
      return NextResponse.json(
        { error: '密码设置失败，请重试' },
        { status: 500 }
      );
    }

    // 记录活动日志
    await logActivity(user.id, ActivityType.UPDATE_PASSWORD);

    return NextResponse.json({
      success: true,
      message: '密码设置成功！您现在可以登录系统了。',
      data: {
        user: {
          id: transactionResult.user.id,
          name: transactionResult.user.name,
          email: generateEmailFromStudentId(transactionResult.user.studentId),
          studentId: transactionResult.user.studentId,
          isEmailVerified: transactionResult.user.isEmailVerified,
          isActive: transactionResult.user.isActive
        }
      }
    });

  } catch (error) {
    console.error('设置密码失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}