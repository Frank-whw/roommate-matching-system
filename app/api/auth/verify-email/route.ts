import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyEmailVerificationToken } from '@/lib/auth/session';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token不能为空'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = verifyEmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token } = result.data;

    // 验证token
    const tokenData = await verifyEmailVerificationToken(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: '验证链接无效或已过期' },
        { status: 400 }
      );
    }

    // 查找用户并验证token是否匹配
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, tokenData.email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const foundUser = user[0];

    // 检查token是否匹配和是否过期
    if (foundUser.emailVerificationToken !== token) {
      return NextResponse.json(
        { error: '验证链接无效' },
        { status: 400 }
      );
    }

    if (foundUser.emailVerificationExpires && foundUser.emailVerificationExpires < new Date()) {
      return NextResponse.json(
        { error: '验证链接已过期，请重新发送验证邮件' },
        { status: 400 }
      );
    }

    if (foundUser.isEmailVerified) {
      return NextResponse.json(
        { error: '邮箱已经验证过了' },
        { status: 400 }
      );
    }

    // 更新用户邮箱验证状态
    const updatedUser = await db
      .update(users)
      .set({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, foundUser.id))
      .returning();

    return NextResponse.json({
      success: true,
      message: '邮箱验证成功！您现在可以登录了。',
      data: {
        user: {
          id: updatedUser[0].id,
          name: updatedUser[0].name,
          email: updatedUser[0].email,
          studentId: updatedUser[0].studentId,
          isEmailVerified: updatedUser[0].isEmailVerified
        }
      }
    });

  } catch (error) {
    console.error('邮箱验证失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}