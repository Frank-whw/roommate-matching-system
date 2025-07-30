import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';
import { hashPassword, signEmailVerificationToken } from '@/lib/auth/session';
import { sendEmailVerification } from '@/lib/email';

const registerSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  studentId: z.string().regex(/^102\d55014\d{2}$/, '学号格式不正确，应为102*55014**格式'),
  password: z.string().min(6, '密码至少需要6个字符').max(100, '密码不能超过100个字符'),
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

    const { name, email, studentId, password } = result.data;

    // 检查邮箱格式是否为教育邮箱
    if (!email.endsWith('.edu.cn') && !email.includes('edu')) {
      return NextResponse.json(
        { error: '请使用教育邮箱进行注册' },
        { status: 400 }
      );
    }

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
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 生成邮箱验证令牌
    const verificationToken = await signEmailVerificationToken(email, studentId);

    // 创建用户
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        studentId,
        hashedPassword,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10分钟后过期
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // 发送验证邮件
    const emailSent = await sendEmailVerification(email, verificationToken, studentId);

    if (!emailSent) {
      console.warn('发送验证邮件失败，但用户创建成功');
    }

    return NextResponse.json({
      success: true,
      message: '注册成功！请查收验证邮件并在10分钟内完成验证。',
      data: {
        user: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          studentId: newUser[0].studentId,
          isEmailVerified: newUser[0].isEmailVerified
        },
        emailSent,
        verificationRequired: true
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