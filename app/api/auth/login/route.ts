import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords, setSession } from '@/lib/auth/session';

const loginSchema = z.object({
  studentId: z.string().min(1, '学号不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { studentId, password } = result.data;

    // 查找用户
    const user = await db
      .select()
      .from(users)
      .where(eq(users.studentId, studentId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: '学号或密码错误' },
        { status: 401 }
      );
    }

    const foundUser = user[0];

    // 验证密码
    const isPasswordValid = await comparePasswords(password, foundUser.hashedPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '学号或密码错误' },
        { status: 401 }
      );
    }

    // 检查邮箱验证状态
    if (!foundUser.isEmailVerified) {
      return NextResponse.json(
        { 
          error: '请先验证邮箱后再登录',
          requireEmailVerification: true,
          email: foundUser.email 
        },
        { status: 403 }
      );
    }

    // 设置会话
    await setSession(foundUser);

    return NextResponse.json({
      success: true,
      message: '登录成功！',
      data: {
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          studentId: foundUser.studentId,
          isEmailVerified: foundUser.isEmailVerified,
          createdAt: foundUser.createdAt
        }
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}