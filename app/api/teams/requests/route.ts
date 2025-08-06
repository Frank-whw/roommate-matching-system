import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/db/queries';
import { reviewJoinRequest } from '@/app/teams/actions';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teamJoinRequests, users, userProfiles, teams, teamMembers } from '@/lib/db/schema';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取待审核的加入申请
export async function GET() {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户担任队长的队伍
    const userTeams = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(and(
        eq(teamMembers.userId, user.users.id),
        eq(teamMembers.isLeader, true)
      ));

    if (userTeams.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 获取这些队伍的待审核申请
    const pendingRequests = await db
      .select({
        id: teamJoinRequests.id,
        userId: teamJoinRequests.userId,
        teamId: teamJoinRequests.teamId,
        status: teamJoinRequests.status,
        message: teamJoinRequests.message,
        createdAt: teamJoinRequests.createdAt,
        user: users,
        userProfile: userProfiles,
        team: teams
      })
      .from(teamJoinRequests)
      .leftJoin(users, eq(teamJoinRequests.userId, users.id))
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .leftJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .where(
        and(
          eq(teamJoinRequests.status, 'pending'),
          // 只显示用户担任队长的队伍的申请
          teamJoinRequests.teamId
        )
      )
      .orderBy(teamJoinRequests.createdAt);

    // 过滤出用户有权管理的申请
    const filteredRequests = pendingRequests.filter(request =>
      userTeams.some(team => team.teamId === request.teamId)
    );

    return NextResponse.json({
      success: true,
      data: filteredRequests
    });

  } catch (error) {
    console.error('获取加入申请失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 审核加入申请
export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await reviewJoinRequest(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('审核加入申请失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}