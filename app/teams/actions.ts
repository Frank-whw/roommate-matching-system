'use server';

import { z } from 'zod';
import { eq, and, count, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, teamJoinRequests, users, userProfiles, ActivityType } from '@/lib/db/schema';
import { getCurrentUser, logActivity } from '@/lib/db/queries';
import { generateEmailFromStudentId } from '@/lib/utils/email';
import { 
  sendJoinRequestNotification, 
  sendApplicationApprovedNotification, 
  sendApplicationRejectedNotification, 
  sendTeamDisbandedNotification,
  sendMemberRemovedNotification,
  sendMemberLeftNotification 
} from '@/lib/email';
import { revalidatePath } from 'next/cache';

// Create team schema
const createTeamSchema = z.object({
  name: z.string().min(1, '队伍名称不能为空').max(100, '队伍名称过长'),
  description: z.string().max(100, '队伍描述不能超过100字').optional(),
  requirements: z.string().max(100, '招募要求不能超过100字').optional(),
  // maxMembers 固定为 4，不再需要从客户端传入
});

// Join team request schema
const joinTeamSchema = z.object({
  teamId: z.number().int().positive('队伍ID不正确'),
  message: z.string().optional(),
});

// Review join request schema
const reviewJoinRequestSchema = z.object({
  requestId: z.number().int().positive('申请ID不正确'),
  approved: z.boolean(),
});

// Leave team schema
const leaveTeamSchema = z.object({
  teamId: z.number().int().positive('队伍ID不正确'),
});

// Remove member schema
const removeMemberSchema = z.object({
  teamId: z.number().int().positive('队伍ID不正确'),
  memberId: z.number().int().positive('成员ID不正确'),
});

// Disband team schema
const disbandTeamSchema = z.object({
  teamId: z.number().int().positive('队伍ID不正确'),
});

// Update team schema
const updateTeamSchema = z.object({
  teamId: z.number().int().positive('队伍ID不正确'),
  name: z.string().min(1, '队伍名称不能为空').max(100, '队伍名称过长').optional(),
  description: z.string().max(100, '队伍描述不能超过100字').optional(),
  requirements: z.string().max(100, '招募要求不能超过100字').optional(),
  // maxMembers 固定为 4，不允许修改
});

// Create a new team
export async function createTeam(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // Validate data
    const result = createTeamSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { name, description, requirements } = result.data;
    const maxMembers = 4; // 固定为4人队伍

    // Check if user is already in a team
    const existingMembership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, currentUserId))
      .limit(1);

    if (existingMembership.length > 0) {
      return { error: '您已经在一个队伍中，请先退出当前队伍' };
    }

    // Get user's gender for the team
    const userProfile = await db
      .select({ gender: userProfiles.gender })
      .from(userProfiles)
      .where(eq(userProfiles.userId, currentUserId))
      .limit(1);

    if (!userProfile[0] || !userProfile[0].gender) {
      return { error: '请先完善个人资料中的性别信息' };
    }

    // Check team count limits by gender
    const teamCountByGender = await db
      .select({ count: count() })
      .from(teams)
      .where(
        and(
          eq(teams.gender, userProfile[0].gender),
          eq(teams.status, 'recruiting')
        )
      );

    const currentTeamCount = teamCountByGender[0]?.count || 0;
    const genderLimit = userProfile[0].gender === 'male' ? 19 : 14;

    if (currentTeamCount >= genderLimit) {
      return { 
        error: `已达到${userProfile[0].gender === 'male' ? '男生' : '女生'}队伍数量上限（${genderLimit}支）` 
      };
    }

    // Create the team (within a transaction)
    const newTeam = await db.transaction(async (tx) => {
      // Create team
      const [team] = await tx.insert(teams).values({
        name,
        description,
        requirements,
        leaderId: currentUserId,
        gender: userProfile[0].gender, // 设置队伍性别为队长性别
        maxMembers,
        currentMembers: 1,
        status: 'recruiting',
      }).returning();

      // Add creator as first team member and leader
      await tx.insert(teamMembers).values({
        teamId: team.id,
        userId: currentUserId,
        isLeader: true,
      });

      return team;
    });

    // Log activity
    await logActivity(
      currentUserId,
      ActivityType.CREATE_TEAM,
      undefined,
      { teamId: newTeam.id, teamName: name }
    );

    revalidatePath('/teams');
    return {
      success: true,
      message: '队伍创建成功！',
      teamId: newTeam.id,
    };

  } catch (error) {
    console.error('创建队伍失败:', error);
    return {
      error: '创建队伍失败，请重试',
    };
  }
}

// 定义Action返回类型
export type ActionResult<T = any> = 
  | {
      success: true;
      message: string;
      data?: T;
      error?: never;
    }
  | {
      success?: false;
      error: string;
      message?: never;
      data?: never;
    };

// Join a team (create join request)
export async function joinTeam(rawData: any): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // Validate data
    const result = joinTeamSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { teamId, message } = result.data;

    // Check if user is already in a team
    const existingMembership = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, currentUserId))
      .limit(1);

    if (existingMembership.length > 0) {
      return { error: '您已经在一个队伍中' };
    }

    // Check if team exists and has space
    const targetTeam = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    if (targetTeam.length === 0) {
      return { error: '队伍不存在' };
    }

    const team = targetTeam[0];

    if (team.currentMembers >= team.maxMembers) {
      return { error: '队伍已满' };
    }

    if (team.status !== 'recruiting') {
      return { error: '队伍当前不接受新成员' };
    }

    if (team.leaderId === currentUserId) {
      return { error: '您不能申请加入自己创建的队伍' };
    }

    // 检查性别是否匹配（如果队伍有性别要求）
    const applicantProfile = await db
      .select({ gender: userProfiles.gender })
      .from(userProfiles)
      .where(eq(userProfiles.userId, currentUserId))
      .limit(1);

    if (!applicantProfile[0] || !applicantProfile[0].gender) {
      return { error: '请先完善个人资料中的性别信息' };
    }

    if (team.gender && team.gender !== applicantProfile[0].gender) {
      return { error: '性别不匹配，无法加入该队伍' };
    }

    // Check if user already has a pending request for this team
    const existingRequest = await db
      .select()
      .from(teamJoinRequests)
      .where(
        and(
          eq(teamJoinRequests.teamId, teamId),
          eq(teamJoinRequests.userId, currentUserId),
          eq(teamJoinRequests.status, 'pending')
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      return { error: '您已经向该队伍发送过申请' };
    }

    // Create join request (申请类型)
    await db.insert(teamJoinRequests).values({
      teamId,
      userId: currentUserId,
      requestType: 'application',
      message: message || '',
      status: 'pending',
    });

    // Get team leader and applicant information for email notification
    const [leaderInfo, applicantInfo] = await Promise.all([
      db.select({
        name: users.name,
        studentId: users.studentId
      })
        .from(users)
        .where(eq(users.id, team.leaderId))
        .limit(1),
      db.select({
        name: users.name,
        studentId: users.studentId
      })
        .from(users)
        .where(eq(users.id, currentUserId))
        .limit(1)
    ]);

    // Send email notification to team leader
    if (leaderInfo[0] && applicantInfo[0]) {
      try {
        const leaderEmail = generateEmailFromStudentId(leaderInfo[0].studentId);
        await sendJoinRequestNotification(
          leaderEmail,
          team.name,
          applicantInfo[0].name || generateEmailFromStudentId(applicantInfo[0].studentId),
          applicantInfo[0].studentId
        );
      } catch (emailError) {
        console.error('发送邮件通知失败:', emailError);
        // 邮件发送失败不影响申请流程
      }
    }

    // Log activity
    await logActivity(
      currentUserId,
      ActivityType.REQUEST_JOIN_TEAM,
      undefined,
      { teamId, teamName: team.name }
    );

    revalidatePath('/teams');
    return {
      success: true,
      message: '申请已发送，等待队长审核',
    };

  } catch (error) {
    console.error('申请加入队伍失败:', error);
    return {
      error: '申请失败，请重试',
    };
  }
}

// Review join request (approve or reject)
export async function reviewJoinRequest(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // Validate data
    const result = reviewJoinRequestSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { requestId, approved } = result.data;

    // Get the join request
    const joinRequest = await db
      .select({
        request: teamJoinRequests,
        team: teams,
        applicant: users,
      })
      .from(teamJoinRequests)
      .innerJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .innerJoin(users, eq(teamJoinRequests.userId, users.id))
      .where(
        and(
          eq(teamJoinRequests.id, requestId),
          eq(teamJoinRequests.requestType, 'application')
        )
      )
      .limit(1);

    if (joinRequest.length === 0) {
      return { error: '申请不存在' };
    }

    const { request, team, applicant } = joinRequest[0];

    // Check if current user is the team leader
    if (team.leaderId !== currentUserId) {
      return { error: '只有队长可以审核申请' };
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return { error: '该申请已被处理' };
    }

    if (approved) {
      // Check if team still has space
      if (team.currentMembers >= team.maxMembers) {
        return { error: '队伍已满' };
      }

      // Check if applicant is still available (not in another team)
      const applicantMembership = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.userId, request.userId))
        .limit(1);

      if (applicantMembership.length > 0) {
        // Update request status to rejected
        await db
          .update(teamJoinRequests)
          .set({
            status: 'rejected',
            reviewedBy: currentUserId,
            reviewedAt: new Date(),
          })
          .where(eq(teamJoinRequests.id, requestId));

        return { error: '该用户已加入其他队伍' };
      }

      // 因为申请时已经过性别筛选，且队伍性别固定不变，这里不需要重复验证性别

      // Approve the request (within a transaction)
      await db.transaction(async (tx) => {
        // 原子占位：仅当未满员时增加成员数，使用Drizzle类型安全的更新
        const updatedTeams = await tx
          .update(teams)
          .set({
            currentMembers: sql`${teams.currentMembers} + 1`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(teams.id, team.id),
              eq(teams.status, 'recruiting'),
              sql`${teams.currentMembers} < ${teams.maxMembers}`
            )
          )
          .returning({ currentMembers: teams.currentMembers });

        if (updatedTeams.length === 0) {
          throw new Error('队伍已满');
        }

        // 尝试插入成员（唯一约束保证用户只能在一个队伍）
        await tx.insert(teamMembers).values({
          teamId: team.id,
          userId: request.userId,
          isLeader: false,
        });

        // 更新请求状态
        await tx
          .update(teamJoinRequests)
          .set({
            status: 'matched',
            reviewedBy: currentUserId,
            reviewedAt: new Date(),
          })
          .where(eq(teamJoinRequests.id, requestId));
      });

      // Log activities
      await Promise.all([
        logActivity(
          currentUserId,
          ActivityType.APPROVE_JOIN_REQUEST,
          undefined,
          { teamId: team.id, applicantId: request.userId }
        ),
        logActivity(
          request.userId,
          ActivityType.JOIN_TEAM,
          undefined,
          { teamId: team.id, teamName: team.name }
        ),
      ]);

      // Send email notification to applicant
      try {
        const applicantEmail = generateEmailFromStudentId(applicant.studentId);
        await sendApplicationApprovedNotification(
          applicantEmail,
          team.name,
          applicant.name || generateEmailFromStudentId(applicant.studentId)
        );
      } catch (emailError) {
        console.error('发送邮件通知失败:', emailError);
        // 邮件发送失败不影响申请流程
      }

      revalidatePath('/teams');
      return {
        success: true,
        message: `已批准 ${applicant.name || generateEmailFromStudentId(applicant.studentId)} 加入队伍`,
      };

    } else {
      // Reject the request
      await db
        .update(teamJoinRequests)
        .set({
          status: 'rejected',
          reviewedBy: currentUserId,
          reviewedAt: new Date(),
        })
        .where(eq(teamJoinRequests.id, requestId));

      // Log activity
      await logActivity(
        currentUserId,
        ActivityType.REJECT_JOIN_REQUEST,
        undefined,
        { teamId: team.id, applicantId: request.userId }
      );

      // Send email notification to applicant
      try {
        const applicantEmail = generateEmailFromStudentId(applicant.studentId);
        await sendApplicationRejectedNotification(
          applicantEmail,
          team.name,
          applicant.name || generateEmailFromStudentId(applicant.studentId)
        );
      } catch (emailError) {
        console.error('发送邮件通知失败:', emailError);
        // 邮件发送失败不影响申请流程
      }

      revalidatePath('/teams');
      return {
        success: true,
        message: '已拒绝该申请',
      };
    }

  } catch (error) {
    console.error('审核申请失败:', error);
    return {
      error: '审核失败，请重试',
    };
  }
}

// Leave team
export async function leaveTeam(rawData: any): Promise<ActionResult> {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // Validate data
    const result = leaveTeamSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { teamId } = result.data;

    // Get team and user membership
    const teamInfo = await db
      .select({
        team: teams,
        membership: teamMembers,
      })
      .from(teams)
      .innerJoin(teamMembers, and(
        eq(teamMembers.teamId, teams.id),
        eq(teamMembers.userId, currentUserId)
      ))
      .where(eq(teams.id, teamId))
      .limit(1);

    if (teamInfo.length === 0) {
      return { error: '您不在该队伍中' };
    }

    const { team, membership } = teamInfo[0];

    // If user is the leader and there are other members, cannot leave (must disband or remove members first)
    if (membership.isLeader && team.currentMembers > 1) {
      return { error: '队长不能直接退出有成员的队伍，请先解散队伍或移除所有成员' };
    }

    // If user is the only member or not a leader, just remove them
    await db.transaction(async (tx) => {
      // Remove user from team
      await tx
        .delete(teamMembers)
        .where(eq(teamMembers.id, membership.id));

      if (team.currentMembers <= 1) {
        // If this was the last member, mark team as disbanded
        await tx
          .update(teams)
          .set({
            status: 'disbanded',
            currentMembers: 0,
            updatedAt: new Date(),
          })
          .where(eq(teams.id, teamId));
      } else {
        // 原子性减少成员数：使用Drizzle类型安全的SQL表达式
        await tx
          .update(teams)
          .set({
            currentMembers: sql`${teams.currentMembers} - 1`,
            updatedAt: new Date(),
          })
          .where(eq(teams.id, teamId));
      }
    });

    // Log activity
    await logActivity(
      currentUserId,
      ActivityType.LEAVE_TEAM,
      undefined,
      { teamId, teamName: team.name }
    );

    // 如果不是队长退出，且队伍还有其他成员，通知队长
    if (!membership.isLeader && team.currentMembers > 1) {
      try {
        // 获取队长信息
        const leaderInfo = await db
          .select({
            user: users,
          })
          .from(users)
          .where(eq(users.id, team.leaderId))
          .limit(1);

        if (leaderInfo[0]) {
          const leaderEmail = generateEmailFromStudentId(leaderInfo[0].user.studentId);
          const leaderName = leaderInfo[0].user.name || '队长';
          const memberName = user.users.name || '成员';

          sendMemberLeftNotification(
            leaderEmail,
            leaderName,
            memberName,
            team.name
          ).catch(console.error);
        }
      } catch (error) {
        console.error('发送退出通知失败:', error);
      }
    }

    revalidatePath('/teams');
    return {
      success: true,
      message: team.currentMembers <= 1 ? '已退出队伍，队伍已解散' : '已退出队伍',
    };

  } catch (error) {
    console.error('退出队伍失败:', error);
    return {
      error: '退出队伍失败，请重试',
    };
  }
}

// Remove team member (leader only)
export async function removeMember(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // Validate data
    const result = removeMemberSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { teamId, memberId } = result.data;

    // Check if current user is the team leader
    const leaderCheck = await db
      .select({
        team: teams,
        membership: teamMembers,
      })
      .from(teams)
      .innerJoin(teamMembers, and(
        eq(teamMembers.teamId, teams.id),
        eq(teamMembers.userId, currentUserId),
        eq(teamMembers.isLeader, true)
      ))
      .where(eq(teams.id, teamId))
      .limit(1);

    if (leaderCheck.length === 0) {
      return { error: '只有队长才能移除成员' };
    }

    // Cannot remove yourself
    if (currentUserId === memberId) {
      return { error: '不能移除自己，请使用退出队伍功能' };
    }

    // Get the member to be removed
    const memberToRemove = await db
      .select({
        member: teamMembers,
        user: users,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.userId, memberId)
        )
      )
      .limit(1);

    if (memberToRemove.length === 0) {
      return { error: '该用户不在队伍中' };
    }

    const team = leaderCheck[0].team;
    const memberInfo = memberToRemove[0];

    // Remove member and update team count
    await db.transaction(async (tx) => {
      // Remove member from team
      await tx
        .delete(teamMembers)
        .where(eq(teamMembers.id, memberInfo.member.id));

      // 原子性减少成员数：使用Drizzle类型安全的SQL表达式
      await tx
        .update(teams)
        .set({
          currentMembers: sql`${teams.currentMembers} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, teamId));
    });

    // Log activities
    await Promise.all([
      logActivity(
        currentUserId,
        ActivityType.REMOVE_TEAM_MEMBER,
        undefined,
        { teamId, removedUserId: memberId, teamName: team.name }
      ),
      logActivity(
        memberId,
        ActivityType.LEAVE_TEAM,
        undefined,
        { teamId, teamName: team.name, removedByLeader: true }
      ),
    ]);

    // 发送邮件通知被移除的成员（最佳努力，不影响主流程）
    try {
      const memberEmail = generateEmailFromStudentId(memberInfo.user.studentId);
      const memberName = memberInfo.user.name || '成员';
      const leaderName = user.users.name || '队长';
      
      sendMemberRemovedNotification(
        memberEmail,
        memberName,
        team.name,
        leaderName
      ).catch(console.error);
    } catch (error) {
      console.error('发送成员移除通知失败:', error);
    }

    revalidatePath('/teams');
    return {
      success: true,
      message: `已移除 ${memberInfo.user.name || generateEmailFromStudentId(memberInfo.user.studentId)}`,
    };

  } catch (error) {
    console.error('移除成员失败:', error);
    return {
      error: '移除成员失败，请重试',
    };
  }
}

// Disband team (leader only)
export async function disbandTeam(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // Validate data
    const result = disbandTeamSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { teamId } = result.data;

    // Check if current user is the team leader
    const leaderCheck = await db
      .select({
        team: teams,
        membership: teamMembers,
      })
      .from(teams)
      .innerJoin(teamMembers, and(
        eq(teamMembers.teamId, teams.id),
        eq(teamMembers.userId, currentUserId),
        eq(teamMembers.isLeader, true)
      ))
      .where(eq(teams.id, teamId))
      .limit(1);

    if (leaderCheck.length === 0) {
      return { error: '只有队长才能解散队伍' };
    }

    const team = leaderCheck[0].team;

    // Get all team members for logging
    const allMembers = await db
      .select({
        member: teamMembers,
        user: users,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));

    // Disband team
    await db.transaction(async (tx) => {
      // Mark team as disbanded
      await tx
        .update(teams)
        .set({
          status: 'disbanded',
          currentMembers: 0,
          updatedAt: new Date(),
          deletedAt: new Date(),
        })
        .where(eq(teams.id, teamId));

      // Remove all team members
      await tx
        .delete(teamMembers)
        .where(eq(teamMembers.teamId, teamId));

      // Cancel all pending join requests
      await tx
        .update(teamJoinRequests)
        .set({
          status: 'rejected',
          reviewedBy: currentUserId,
          reviewedAt: new Date(),
        })
        .where(
          and(
            eq(teamJoinRequests.teamId, teamId),
            eq(teamJoinRequests.status, 'pending')
          )
        );
    });

    // Log activities for all members
    const activityPromises = allMembers.map(({ member, user }) =>
      logActivity(
        user.id,
        ActivityType.DISBAND_TEAM,
        undefined,
        {
          teamId,
          teamName: team.name,
          disbandedBy: currentUserId,
          wasLeader: member.isLeader,
        }
      )
    );

    await Promise.all(activityPromises);

    // Send email notifications to all members
    const emailPromises = allMembers.map(async ({ member, user }) => {
      try {
        const userEmail = generateEmailFromStudentId(user.studentId);
        await sendTeamDisbandedNotification(
          userEmail,
          team.name,
          user.name || generateEmailFromStudentId(user.studentId),
          member.isLeader
        );
      } catch (emailError) {
        console.error(`发送邮件通知失败 (用户 ${user.id}):`, emailError);
        // 邮件发送失败不影响解散流程
      }
    });

    await Promise.all(emailPromises);

    revalidatePath('/teams');
    return {
      success: true,
      message: `队伍 "${team.name}" 已解散`,
    };

  } catch (error) {
    console.error('解散队伍失败:', error);
    return {
      error: '解散队伍失败，请重试',
    };
  }
}

// Update team information (leader only)
export async function updateTeam(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // Validate data
    const result = updateTeamSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { teamId, name, description, requirements } = result.data;

    // Check if current user is the team leader
    const leaderCheck = await db
      .select({
        team: teams,
        membership: teamMembers,
      })
      .from(teams)
      .innerJoin(teamMembers, and(
        eq(teamMembers.teamId, teams.id),
        eq(teamMembers.userId, currentUserId),
        eq(teamMembers.isLeader, true)
      ))
      .where(eq(teams.id, teamId))
      .limit(1);

    if (leaderCheck.length === 0) {
      return { error: '只有队长才能修改队伍信息' };
    }

    const team = leaderCheck[0].team;

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    // maxMembers 固定为 4，不允许修改

    // Update team
    await db
      .update(teams)
      .set(updateData)
      .where(eq(teams.id, teamId));

    // Log activity
    await logActivity(
      currentUserId,
      ActivityType.CREATE_TEAM, // Reuse create team activity type for updates
      undefined,
      {
        teamId,
        teamName: name || team.name,
        action: 'update',
        changes: Object.keys(updateData).filter(key => key !== 'updatedAt')
      }
    );

    revalidatePath('/teams');
    return {
      success: true,
      message: '队伍信息已更新',
    };

  } catch (error) {
    console.error('更新队伍信息失败:', error);
    return {
      error: '更新失败，请重试',
    };
  }
}