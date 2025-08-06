import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db/queries';
import { unmatchUser } from '@/app/explore/actions';

// 取消匹配
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
    const matchId = parseInt(id);
    if (isNaN(matchId)) {
      return NextResponse.json({ error: 'Invalid match ID' }, { status: 400 });
    }

    const result = await unmatchUser({ matchId });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('取消匹配失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}