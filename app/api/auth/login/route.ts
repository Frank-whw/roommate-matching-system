import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords, setSession, isSha256Hex, hashPassword } from '@/lib/auth/session';
import { generateEmailFromStudentId } from '@/lib/utils/email';

// 强制动态渲染
export const dynamic = 'force-dynamic';

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
    const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '学号或密码错误' },
        { status: 401 }
      );
    }

    // 如为旧版SHA-256哈希且验证通过，立即迁移为bcrypt
    if (isSha256Hex(foundUser.passwordHash)) {
      try {
        const newHash = await hashPassword(password);
        await db
          .update(users)
          .set({ passwordHash: newHash, updatedAt: new Date() })
          .where(eq(users.id, foundUser.id));
        foundUser.passwordHash = newHash;
      } catch (e) {
        console.warn('密码迁移为bcrypt失败（继续登录流程）:', e);
      }
    }

    // 检查邮箱验证状态
    if (!foundUser.isEmailVerified) {
      return NextResponse.json(
        {
          error: '请先验证邮箱后再登录',
          requireEmailVerification: true,
          email: generateEmailFromStudentId(foundUser.studentId)
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
          email: generateEmailFromStudentId(foundUser.studentId),
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
