import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUsersForMatching } from '@/lib/db/queries';
import { z } from 'zod';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取用户列表（用于匹配）
export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const gender = url.searchParams.get('gender');
    const mbti = url.searchParams.get('mbti');
    const studyHabit = url.searchParams.get('studyHabit');

    const filters = {
      gender: gender || undefined,
      mbti: mbti || undefined,
      studyHabit: studyHabit || undefined,
    };

    const users = await getUsersForMatching(user.users.id, limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        limit,
        count: users.length
      }
    });

  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}