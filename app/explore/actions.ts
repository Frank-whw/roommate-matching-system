'use server';

import { z } from 'zod';
import { eq, and, or } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teamJoinRequests, teams, teamMembers, userProfiles, ActivityType } from '@/lib/db/schema';
import { getCurrentUser, logActivity } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

// 邀请加入队伍操作schema
const inviteToTeamSchema = z.object({
  targetUserId: z.number().int().positive('目标用户ID不正确'),
  message: z.string().optional()
});

export async function inviteUserToTeam(rawData: any) {
  try {
    // 获取当前用户
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // 验证数据
    const result = inviteToTeamSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { targetUserId, message } = result.data;

    // 检查是否是自己
    if (currentUserId === targetUserId) {
      return { error: '不能邀请自己' };
    }

    // 检查当前用户是否在队伍中且是队长
    const currentUserTeam = await db
      .select({
        team: teams,
        membership: teamMembers
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          eq(teamMembers.userId, currentUserId),
          eq(teamMembers.isLeader, true)
        )
      )
      .limit(1);

    if (currentUserTeam.length === 0) {
      return { error: '您需要先创建或成为队伍队长才能邀请他人' };
    }

    const team = currentUserTeam[0].team;

    // 检查队伍是否已满
    if (team.currentMembers >= team.maxMembers) {
      return { error: '队伍已满，无法邀请更多成员' };
    }

    // 检查队伍状态
    if (team.status !== 'recruiting') {
      return { error: '队伍当前不接受新成员' };
    }

    // 检查目标用户是否已经在队伍中
    const targetUserTeam = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, targetUserId))
      .limit(1);

    if (targetUserTeam.length > 0) {
      return { error: '该用户已经在其他队伍中' };
    }

    // 检查目标用户性别是否匹配
    const targetUserProfile = await db
      .select({ gender: userProfiles.gender })
      .from(userProfiles)
      .where(eq(userProfiles.userId, targetUserId))
      .limit(1);

    if (!targetUserProfile[0] || !targetUserProfile[0].gender) {
      return { error: '目标用户资料不完整' };
    }

    if (team.gender && team.gender !== targetUserProfile[0].gender) {
      return { error: '性别不匹配，无法邀请该用户' };
    }

    // 检查是否已经发送过邀请
    const existingInvite = await db
      .select()
      .from(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.teamId, team.id),
          eq(teamJoinRequests.userId, targetUserId),
          eq(teamJoinRequests.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvite.length > 0) {
      return { error: '您已经邀请过该用户' };
    }

    // 创建邀请记录（使用teamJoinRequests表，但标记为邀请类型）
    await db.insert(teamJoinRequests).values({
      teamId: team.id,
      userId: targetUserId,
      message: message || `${user.users.name || '队长'}邀请您加入队伍「${team.name}」`,
      status: 'pending',
      // 可以添加一个字段来区分是申请还是邀请，这里暂时用message来区分
    });

    // 记录活动日志
    await logActivity(
      currentUserId, 
      ActivityType.REQUEST_JOIN_TEAM, // 复用现有的活动类型
      undefined,
      { targetUserId, teamId: team.id, teamName: team.name }
    );

    // 重新验证相关页面
    revalidatePath('/explore');
    revalidatePath('/teams');

    return {
      success: true,
      message: '邀请已发送，等待对方回应',
      teamId: team.id,
      action: 'invite'
    };

  } catch (error) {
    console.error('邀请用户失败:', error);
    return {
      error: '邀请失败，请重试'
    };
  }
}

// 获取用户收到的队伍邀请
export async function getUserTeamInvites() {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // 查询用户收到的队伍邀请
    const invites = await db
      .select({
        request: teamJoinRequests,
        team: teams,
      })
      .from(teamJoinRequests)
      .innerJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .where(
        and(
          eq(teamJoinRequests.userId, currentUserId),
          eq(teamJoinRequests.status, 'pending')
        )
      );

    return {
      success: true,
      invites
    };

  } catch (error) {
    console.error('获取邀请列表失败:', error);
    return {
      error: '获取邀请列表失败'
    };
  }
}

// 响应队伍邀请
const respondToInviteSchema = z.object({
  requestId: z.number().int().positive('邀请ID不正确'),
  accept: z.boolean()
});

export async function respondToTeamInvite(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // 验证数据
    const result = respondToInviteSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { requestId, accept } = result.data;

    // 获取邀请记录
    const inviteRecord = await db
      .select({
        request: teamJoinRequests,
        team: teams
      })
      .from(teamJoinRequests)
      .innerJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .where(
        and(
          eq(teamJoinRequests.id, requestId),
          eq(teamJoinRequests.userId, currentUserId),
          eq(teamJoinRequests.status, 'pending')
        )
      )
      .limit(1);

    if (inviteRecord.length === 0) {
      return { error: '邀请不存在或已被处理' };
    }

    const { request, team } = inviteRecord[0];

    if (accept) {
      // 检查用户是否已经在其他队伍中
      const existingMembership = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.userId, currentUserId))
        .limit(1);

      if (existingMembership.length > 0) {
        return { error: '您已经在其他队伍中' };
      }

      // 检查队伍是否还有空位
      if (team.currentMembers >= team.maxMembers) {
        return { error: '队伍已满' };
      }

      // 接受邀请
      await db.transaction(async (tx) => {
        // 加入队伍
        await tx.insert(teamMembers).values({
          teamId: team.id,
          userId: currentUserId,
          isLeader: false,
        });

        // 更新队伍成员数
        await tx
          .update(teams)
          .set({
            currentMembers: team.currentMembers + 1,
            updatedAt: new Date(),
          })
          .where(eq(teams.id, team.id));

        // 更新邀请状态
        await tx
          .update(teamJoinRequests)
          .set({
            status: 'matched',
            reviewedAt: new Date(),
          })
          .where(eq(teamJoinRequests.id, requestId));
      });

      // 记录活动日志
      await logActivity(
        currentUserId,
        ActivityType.JOIN_TEAM,
        undefined,
        { teamId: team.id, teamName: team.name }
      );

      revalidatePath('/teams');
      revalidatePath('/explore');

      return {
        success: true,
        message: `已加入队伍「${team.name}」`
      };
    } else {
      // 拒绝邀请
      await db
        .update(teamJoinRequests)
        .set({
          status: 'rejected',
          reviewedAt: new Date(),
        })
        .where(eq(teamJoinRequests.id, requestId));

      return {
        success: true,
        message: '已拒绝邀请'
      };
    }

  } catch (error) {
    console.error('响应邀请失败:', error);
    return {
      error: '操作失败，请重试'
    };
  }
}

// 向后兼容：保留原有的likeUser函数，但重定向到邀请功能
export async function likeUser(rawData: any) {
  return inviteUserToTeam(rawData);
}

// 获取用户匹配列表（临时占位符函数）
export async function getUserMatches() {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    // 由于系统已改为邀请机制，返回空的匹配列表
    return {
      success: true,
      matches: [],
      message: '系统已升级为队伍邀请机制，不再使用传统匹配功能'
    };
  } catch (error) {
    console.error('获取匹配列表失败:', error);
    return {
      error: '获取匹配列表失败'
    };
  }
}

// 取消匹配（临时占位符函数）
export async function unmatchUser(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    // 由于系统已改为邀请机制，返回不支持的操作提示
    return {
      error: '系统已升级为队伍邀请机制，不再支持取消匹配功能。请使用队伍管理功能。',
      message: '操作不支持'
    };
  } catch (error) {
    console.error('取消匹配失败:', error);
    return {
      error: '操作失败',
      message: '操作失败'
    };
  }
}