import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db/queries';
import { likeUser, getUserMatches, unmatchUser } from '@/app/explore/actions';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取当前用户的匹配列表
export async function GET() {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const matchesResult = await getUserMatches();
    
    if (matchesResult.error) {
      return NextResponse.json({ error: matchesResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: matchesResult.matches || []
    });

  } catch (error) {
    console.error('获取匹配列表失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 点赞用户（创建匹配）
export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await likeUser(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Operation completed',
      data: {
        isMatch: (result as any).isMatch || false,
        like: (result as any).like || null
      }
    });

  } catch (error) {
    console.error('点赞用户失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}