import { desc, and, eq, isNull, or, inArray, count, ne, notInArray, sql, gte, lte, ilike } from 'drizzle-orm';
import { db } from './drizzle';
import { 
  activityLogs, 
  users, 
  userProfiles, 
  teams, 
  teamMembers, 
  teamJoinRequests, 
  matches,
  ActivityType,
  NewUser
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const sessionData = await verifyToken(sessionCookie.value);
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      return null;
    }

    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);

    if (user.length === 0) {
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Error in getUser:', error);
    return null;
  }
}

// 获取当前用户（包含session信息）
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie || !sessionCookie.value) {
      return { user: null, session: null };
    }

    const sessionData = await verifyToken(sessionCookie.value);
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      return { user: null, session: null };
    }

    if (new Date(sessionData.expires) < new Date()) {
      return { user: null, session: null };
    }

    const user = await getUserWithProfile(sessionData.user.id);
    
    return {
      user: user,
      session: sessionData
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, session: null };
  }
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      metadata: activityLogs.metadata,
      userName: users.name
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

// 用户相关查询
export async function getUserByStudentId(studentId: string) {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.studentId, studentId), isNull(users.deletedAt)))
    .limit(1);
  
  return result[0] || null;
}

// 通过邮箱查找用户（邮箱通过学号生成）
export async function getUserByEmail(email: string) {
  // 从邮箱中提取学号
  const studentId = email.replace('@stu.ecnu.edu.cn', '');
  return await getUserByStudentId(studentId);
}

// 根据学号生成邮箱
export function generateEmailFromStudentId(studentId: string): string {
  return `${studentId}@stu.ecnu.edu.cn`;
}

// 创建新用户
export async function createUser(userData: NewUser) {
  const result = await db
    .insert(users)
    .values(userData)
    .returning();
  
  return result[0];
}

// 更新用户邮箱验证状态
export async function updateUserEmailVerification(userId: number, isVerified: boolean) {
  await db
    .update(users)
    .set({ 
      isEmailVerified: isVerified,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

// 更新用户邮箱验证令牌
export async function updateUserEmailVerificationToken(
  userId: number, 
  token: string, 
  expires: Date
) {
  await db
    .update(users)
    .set({ 
      emailVerificationToken: token,
      emailVerificationExpires: expires,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

// 获取用户资料（包含profile）
export async function getUserWithProfile(userId: number) {
  const result = await db
    .select()
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);
  
  return result[0] || null;
}

// 记录活动日志
export async function logActivity(
  userId: number, 
  action: ActivityType, 
  ipAddress?: string, 
  metadata?: any
) {
  await db.insert(activityLogs).values({
    userId,
    action,
    ipAddress,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });
}

// 匹配相关查询
interface MatchingFilters {
  search?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  sleepTime?: string;
  studyHabit?: string[];
  lifestyle?: string[];
  cleanliness?: string[];
  mbti?: string[];
}

export async function getUsersForMatching(
  currentUserId: number, 
  limit = 20, 
  filters: MatchingFilters = {}
) {
  // 获取当前用户的性别信息
  const currentUserProfile = await db
    .select({ gender: userProfiles.gender })
    .from(userProfiles)
    .where(eq(userProfiles.userId, currentUserId))
    .limit(1);

  if (!currentUserProfile[0] || !currentUserProfile[0].gender) {
    // 如果当前用户没有性别信息，返回空数组
    return [];
  }

  const currentUserGender = currentUserProfile[0].gender;

  // 获取当前用户已经发送邀请的用户ID（仅当用户是队长时）
  const sentInviteUsers = await db
    .select({ userId: teamJoinRequests.userId })
    .from(teamJoinRequests)
    .innerJoin(teams, eq(teamJoinRequests.teamId, teams.id))
    .where(
      and(
        eq(teams.leaderId, currentUserId),
        eq(teamJoinRequests.status, 'pending') // 只排除待处理的邀请
      )
    );
  
  const interactedUserIds = sentInviteUsers.map(u => u.userId);
  
  // 基本筛选条件（包含同性别过滤）
  let whereConditions = [
    eq(users.isActive, true),
    eq(users.isEmailVerified, true),
    eq(userProfiles.isProfileComplete, true),
    isNull(users.deletedAt),
    ne(users.id, currentUserId),
    eq(userProfiles.gender, currentUserGender) // 只显示同性别用户
  ];
  
  // 排除已互动用户
  if (interactedUserIds.length > 0) {
    whereConditions.push(notInArray(users.id, interactedUserIds));
  }

  // 应用其他筛选条件（移除gender过滤，因为已经强制同性别）
  if (filters.minAge !== undefined) {
    whereConditions.push(gte(userProfiles.age, filters.minAge));
  }

  if (filters.maxAge !== undefined) {
    whereConditions.push(lte(userProfiles.age, filters.maxAge));
  }

  if (filters.studyHabit && filters.studyHabit.length > 0) {
    whereConditions.push(inArray(userProfiles.studyHabit, filters.studyHabit as ('library' | 'dormitory' | 'flexible')[]));
  }

  if (filters.lifestyle && filters.lifestyle.length > 0) {
    whereConditions.push(inArray(userProfiles.lifestyle, filters.lifestyle as ('quiet' | 'social' | 'balanced')[]));
  }

  if (filters.cleanliness && filters.cleanliness.length > 0) {
    whereConditions.push(inArray(userProfiles.cleanliness, filters.cleanliness as ('extremely_clean' | 'regularly_tidy' | 'acceptable')[]));
  }

  if (filters.mbti && filters.mbti.length > 0) {
    whereConditions.push(inArray(userProfiles.mbti, filters.mbti as ('INTJ' | 'INTP' | 'ENTJ' | 'ENTP' | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP')[]));
  }

  // 关键词搜索（在个人简介、专业、爱好中搜索）
  if (filters.search && filters.search.trim()) {
    const searchTerm = `%${filters.search.trim().toLowerCase()}%`;
    whereConditions.push(
      or(
        ilike(userProfiles.bio, searchTerm),
        ilike(userProfiles.hobbies, searchTerm),
        ilike(userProfiles.roommateExpectations, searchTerm),
        ilike(users.name, searchTerm)
      )!
    );
  }

  return await db
    .select({
      user: users,
      profile: userProfiles
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(and(...whereConditions))
    .orderBy(desc(users.updatedAt)) // 按更新时间排序，显示最活跃的用户
    .limit(limit);
}

// 队伍相关查询
export async function getUserTeam(userId: number) {
  const result = await db
    .select({
      team: teams,
      membership: teamMembers
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.userId, userId),
        isNull(teams.deletedAt)
      )
    )
    .limit(1);
  
  return result[0] || null;
}

export async function getTeamWithMembers(teamId: number) {
  const team = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, teamId), isNull(teams.deletedAt)))
    .limit(1);
  
  if (!team[0]) return null;
  
  const members = await db
    .select({
      user: users,
      profile: userProfiles,
      membership: teamMembers
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(teamMembers.teamId, teamId));
  
  return {
    ...team[0],
    members
  };
}

// 获取队伍成员（包含联系信息，仅限队伍成员访问）
export async function getTeamWithMembersContact(teamId: number, currentUserId: number) {
  // 首先验证当前用户是否为该队伍成员
  const membership = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, currentUserId)))
    .limit(1);

  if (!membership[0]) {
    return null; // 不是队伍成员，无权访问
  }

  const team = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, teamId), isNull(teams.deletedAt)))
    .limit(1);
  
  if (!team[0]) return null;
  
  const members = await db
    .select({
      user: users,
      profile: userProfiles,
      membership: teamMembers
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(teamMembers.teamId, teamId));
  
  return {
    ...team[0],
    members: members.map(member => ({
      ...member,
      // 包含联系信息，因为都是队友
      contactInfo: {
        wechatId: member.profile?.wechatId || null
      }
    }))
  };
}

export async function getAllTeams(userId: number, limit = 20) {
  // 获取当前用户的性别信息
  const currentUserProfile = await db
    .select({ gender: userProfiles.gender })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!currentUserProfile[0] || !currentUserProfile[0].gender) {
    // 如果当前用户没有性别信息，返回空数组
    return [];
  }

  const currentUserGender = currentUserProfile[0].gender;

  // 获取所有同性别队伍（包括已满的）
  return await db
    .select({
      team: teams,
      leader: users,
      memberCount: count(teamMembers.id)
    })
    .from(teams)
    .leftJoin(users, eq(teams.leaderId, users.id))
    .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(and(
      eq(teams.gender, currentUserGender), // 只显示同性别队伍
      isNull(teams.deletedAt)
    ))
    .groupBy(teams.id, users.id)
    .orderBy(desc(teams.createdAt))
    .limit(limit);
}

export async function getAvailableTeams(userId: number, limit = 20) {
  // 获取当前用户的性别信息
  const currentUserProfile = await db
    .select({ gender: userProfiles.gender })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (!currentUserProfile[0] || !currentUserProfile[0].gender) {
    // 如果当前用户没有性别信息，返回空数组
    return [];
  }

  const currentUserGender = currentUserProfile[0].gender;

  // 排除用户已在的队伍和已申请的队伍
  const userTeam = await getUserTeam(userId);
  const excludeTeamIds = [];
  
  if (userTeam) {
    excludeTeamIds.push(userTeam.team.id);
  }
  
  const pendingRequests = await db
    .select({ teamId: teamJoinRequests.teamId })
    .from(teamJoinRequests)
    .where(
      and(
        eq(teamJoinRequests.userId, userId),
        eq(teamJoinRequests.status, 'pending')
      )
    );
  
  excludeTeamIds.push(...pendingRequests.map(r => r.teamId));
  
  const conditions = [
    eq(teams.status, 'recruiting'),
    eq(teams.gender, currentUserGender), // 直接过滤同性别队伍
    isNull(teams.deletedAt)
  ];
  
  if (excludeTeamIds.length > 0) {
    conditions.push(notInArray(teams.id, excludeTeamIds));
  }
  
  // 获取符合条件的队伍
  return await db
    .select({
      team: teams,
      leader: users,
      memberCount: count(teamMembers.id)
    })
    .from(teams)
    .leftJoin(users, eq(teams.leaderId, users.id))
    .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
    .where(and(...conditions))
    .groupBy(teams.id, users.id)
    .limit(limit);
}

// 个人资料相关查询
export async function createUserProfile(profileData: any) {
  const result = await db
    .insert(userProfiles)
    .values(profileData)
    .returning();
  
  return result[0];
}

export async function updateUserProfile(userId: number, profileData: any) {
  const result = await db
    .update(userProfiles)
    .set({
      ...profileData,
      updatedAt: new Date()
    })
    .where(eq(userProfiles.userId, userId))
    .returning();
  
  return result[0];
}

export async function getUserProfileData(userId: number) {
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  
  return result[0] || null;
}

// 验证两个用户是否为队友
export async function areTeammates(userId1: number, userId2: number): Promise<boolean> {
  try {
    // 如果是同一个用户，返回 false
    if (userId1 === userId2) return false;
    
    // 查询两个用户是否在同一个队伍中
    const result = await db
      .select({
        teamId: teamMembers.teamId,
        userId: teamMembers.userId
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          or(eq(teamMembers.userId, userId1), eq(teamMembers.userId, userId2)),
          isNull(teams.deletedAt) // 队伍未被删除
        )
      );

    // 按 teamId 分组，检查是否有队伍包含两个用户
    const teamGroups = new Map<number, number[]>();
    for (const row of result) {
      if (!teamGroups.has(row.teamId)) {
        teamGroups.set(row.teamId, []);
      }
      teamGroups.get(row.teamId)!.push(row.userId);
    }

    // 检查是否有队伍同时包含两个用户
    for (const members of teamGroups.values()) {
      if (members.includes(userId1) && members.includes(userId2)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking teammates:', error);
    return false;
  }
}

// 获取用户联系信息（仅限队友）
export async function getUserContactInfo(currentUserId: number, targetUserId: number) {
  try {
    // 验证是否为队友
    const isTeammate = await areTeammates(currentUserId, targetUserId);
    if (!isTeammate) {
      return null; // 不是队友，不返回联系信息
    }

    // 获取目标用户的联系信息
    const result = await db
      .select({
        user: users,
        profile: userProfiles
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(and(eq(users.id, targetUserId), isNull(users.deletedAt)))
      .limit(1);

    if (!result[0]) return null;

    const { user, profile } = result[0];
    return {
      id: user.id,
      name: user.name,
      email: generateEmailFromStudentId(user.studentId),
      wechatId: profile?.wechatId || null
    };
  } catch (error) {
    console.error('Error getting user contact info:', error);
    return null;
  }
}