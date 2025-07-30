import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, signPasswordSetupToken } from '@/lib/auth/session';
import { sendPasswordSetupEmail } from '@/lib/email';

const registerSchema = z.object({
  studentId: z.string().regex(/^102\d55014\d{2}$/, '学号格式不正确，应为102*55014**格式'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '请同意用户协议和隐私政策'
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { studentId } = result.data;
    
    // 自动生成邮箱和姓名
    const email = `${studentId}@stu.ecnu.edu.cn`;
    const name = `用户${studentId}`;

    // 检查用户是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(or(
        eq(users.email, email),
        eq(users.studentId, studentId)
      ))
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      // 如果用户已经设置了密码，则认为已完成注册
      if (user.passwordHash && user.passwordHash.trim() !== '') {
        if (user.email === email) {
          return NextResponse.json(
            { error: '该邮箱已被注册' },
            { status: 409 }
          );
        }
        if (user.studentId === studentId) {
          return NextResponse.json(
            { error: '该学号已被注册' },
            { status: 409 }
          );
        }
      } else {
        // 如果用户存在但未设置密码，删除旧记录，允许重新注册
        await db.delete(users).where(eq(users.id, user.id));
      }
    }

    // 生成设置密码的令牌
    const passwordSetupToken = await signPasswordSetupToken(email, studentId);

    // 创建临时用户（无密码）
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        studentId,
        passwordHash: '', // 临时空密码，等待用户设置
        isActive: false, // 设置为未激活，直到密码设置完成
        isEmailVerified: false,
        emailVerificationToken: passwordSetupToken,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10分钟后过期
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // 发送设置密码的邮件
    const emailSent = await sendPasswordSetupEmail(email, passwordSetupToken, studentId);

    if (!emailSent) {
      console.warn('发送设置密码邮件失败');
      return NextResponse.json(
        { error: '邮件发送失败，请重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '注册成功！设置密码的邮件已发送到 ' + email + '（开发环境下邮件内容显示在服务器控制台中），请在10分钟内完成密码设置。',
      data: {
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          studentId: newUser[0].studentId,
          isEmailVerified: newUser[0].isEmailVerified
        },
        emailSent,
        passwordSetupRequired: true,
        emailAddress: email,
        note: '开发环境下，邮件内容会显示在服务器控制台中，请查看终端输出获取设置密码链接。'
      }
    });

  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}