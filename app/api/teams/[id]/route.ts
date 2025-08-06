import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getTeamWithMembers } from '@/lib/db/queries';
import { updateTeam, disbandTeam } from '@/app/teams/actions';

// 获取特定队伍的详细信息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const team = await getTeamWithMembers(teamId);
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: team
    });

  } catch (error) {
    console.error('获取队伍信息失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新队伍信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const body = await request.json();
    const result = await updateTeam({ teamId, ...body });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.team
    });

  } catch (error) {
    console.error('更新队伍失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 解散队伍
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const teamId = parseInt(id);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const result = await disbandTeam({ teamId });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('解散队伍失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}