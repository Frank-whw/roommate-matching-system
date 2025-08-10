import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gte, ne, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { 
  matches, 
  users, 
  userProfiles, 
  teams, 
  teamJoinRequests, 
  teamMembers
} from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/db/queries';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.users.id;
    const url = new URL(request.url);
    const sinceParam = url.searchParams.get('since');
    
    // 如果没有提供since参数，使用5分钟前作为默认值
    const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 5 * 60 * 1000);

    const updates: any = {
      newMatches: [],
      teamNotifications: [],
      teamInvitations: [] // 替换newLikes为队伍邀请
    };

    // 检查新匹配
    const newMatches = await db
      .select({
        id: matches.id,
        user1Id: matches.user1Id,
        user2Id: matches.user2Id,
        matchedUser: users,
        matchedUserProfile: userProfiles,
        createdAt: matches.createdAt
      })
      .from(matches)
      .leftJoin(users, 
        eq(users.id, 
          sql`CASE WHEN ${matches.user1Id} = ${userId} THEN ${matches.user2Id} ELSE ${matches.user1Id} END`
        )
      )
      .leftJoin(userProfiles, 
        eq(userProfiles.userId, 
          sql`CASE WHEN ${matches.user1Id} = ${userId} THEN ${matches.user2Id} ELSE ${matches.user1Id} END`
        )
      )
      .where(
        and(
          gte(matches.createdAt, since),
          eq(matches.status, 'matched'),
          // 用户是匹配的一方
          or(
            eq(matches.user1Id, userId),
            eq(matches.user2Id, userId)
          )
        )
      )
      .limit(10);

    updates.newMatches = newMatches;

    // 检查队伍相关通知
    const teamNotifications: any[] = [];

    // 1. 检查新的加入申请（如果用户是队长）
    const userTeams = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.isLeader, true)
      ));

    if (userTeams.length > 0) {
      for (const team of userTeams) {
        const newJoinRequests = await db
          .select({
            id: teamJoinRequests.id,
            user: users,
            userProfile: userProfiles,
            team: teams,
            createdAt: teamJoinRequests.createdAt
          })
          .from(teamJoinRequests)
          .leftJoin(users, eq(teamJoinRequests.userId, users.id))
          .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
          .leftJoin(teams, eq(teamJoinRequests.teamId, teams.id))
          .where(
            and(
              eq(teamJoinRequests.teamId, team.teamId),
              eq(teamJoinRequests.status, 'pending'),
              gte(teamJoinRequests.createdAt, since)
            )
          );

        newJoinRequests.forEach(request => {
          teamNotifications.push({
            type: 'team_join_request',
            title: '🔔 新的入队申请',
            message: `${request.user?.name || '有人'} 申请加入您的队伍 "${request.team?.name}"`,
            data: {
              requestId: request.id,
              teamId: team.teamId,
              applicantId: request.user?.id,
              applicantName: request.user?.name
            }
          });
        });
      }
    }

    // 2. 检查申请状态变化（如果用户发送了申请）
    const userJoinRequests = await db
      .select({
        id: teamJoinRequests.id,
        status: teamJoinRequests.status,
        team: teams,
        reviewedAt: teamJoinRequests.reviewedAt,
        updatedAt: teamJoinRequests.updatedAt
      })
      .from(teamJoinRequests)
      .leftJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .where(
        and(
          eq(teamJoinRequests.userId, userId),
          gte(teamJoinRequests.updatedAt, since),
          ne(teamJoinRequests.status, 'pending')
        )
      );

    userJoinRequests.forEach(request => {
      if (request.status === 'matched') {
        teamNotifications.push({
          type: 'team_request_approved',
          title: '✅ 申请已通过',
          message: `您的入队申请已被批准！欢迎加入队伍 "${request.team?.name}"`,
          data: {
            teamId: request.team?.id,
            teamName: request.team?.name
          }
        });
      } else if (request.status === 'rejected') {
        teamNotifications.push({
          type: 'team_request_rejected',
          title: '❌ 申请被拒绝',
          message: `很遗憾，您的入队申请 "${request.team?.name}" 被拒绝了`,
          data: {
            teamId: request.team?.id,
            teamName: request.team?.name
          }
        });
      }
    });

    updates.teamNotifications = teamNotifications;

    // 检查新的队伍邀请（用户收到的邀请）
    const teamInvitations = await db
      .select({
        id: teamJoinRequests.id,
        team: teams,
        leaderName: users.name,
        message: teamJoinRequests.message,
        createdAt: teamJoinRequests.createdAt
      })
      .from(teamJoinRequests)
      .leftJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .leftJoin(users, eq(teams.leaderId, users.id))
      .where(
        and(
          eq(teamJoinRequests.userId, userId),
          eq(teamJoinRequests.status, 'pending'),
          gte(teamJoinRequests.createdAt, since)
        )
      )
      .limit(5);

    updates.teamInvitations = teamInvitations;

    return NextResponse.json(updates);

  } catch (error) {
    console.error('Error checking realtime updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}