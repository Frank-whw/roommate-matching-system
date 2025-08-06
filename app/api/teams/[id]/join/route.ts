import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db/queries';
import { joinTeam, leaveTeam } from '@/app/teams/actions';

// 申请加入队伍
export async function POST(
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

    const result = await joinTeam({ teamId });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Join request submitted',
      data: (result as any).joinRequest || null
    });

  } catch (error) {
    console.error('申请加入队伍失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 退出队伍
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

    const result = await leaveTeam({ teamId });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('退出队伍失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}