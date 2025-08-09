import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db/queries';
import { removeMember } from '@/app/teams/actions';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 移除队员
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

    const body = await request.json();
    const { action, targetUserId } = body;

    if (action !== 'remove') {
      return NextResponse.json({ error: 'Only remove action is supported' }, { status: 400 });
    }

    const result = await removeMember({ teamId, memberId: targetUserId });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'Member removed successfully'
    });

  } catch (error) {
    console.error('队伍成员操作失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}