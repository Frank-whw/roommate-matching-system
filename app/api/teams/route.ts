import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getAvailableTeams, getUserTeam } from '@/lib/db/queries';
import { createTeam } from '@/app/teams/actions';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取可用队伍列表
export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type') || 'available'; // available, my
    const search = url.searchParams.get('search') || undefined;

    if (type === 'my') {
      // 获取用户自己的队伍
      const myTeam = await getUserTeam(user.users.id);
      return NextResponse.json({
        success: true,
        data: myTeam ? [myTeam] : []
      });
    } else {
      // 获取可加入的队伍列表
      const teams = await getAvailableTeams(user.users.id, limit, { search });
      return NextResponse.json({
        success: true,
        data: teams,
        pagination: {
          limit,
          count: teams.length
        }
      });
    }

  } catch (error) {
    console.error('获取队伍列表失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 创建新队伍
export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await createTeam(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        teamId: result.teamId
      }
    });

  } catch (error) {
    console.error('创建队伍失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}