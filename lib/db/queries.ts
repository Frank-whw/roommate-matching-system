import { desc, and, eq, isNull, or, inArray, count, ne, notInArray, sql, gte, lte, ilike } from 'drizzle-orm';
import { db } from './drizzle';
import { 
  activityLogs, 
  users, 
  userProfiles, 
  teams, 
  teamMembers, 
  teamJoinRequests, 
  userLikes, 
  matches,
  ActivityType,
  NewUser
} from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
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
}

// 获取当前用户（包含session信息）
export async function getCurrentUser() {
  const sessionCookie = (await cookies()).get('session');
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

export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);
  
  return result[0] || null;
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
  // 获取当前用户已经点赞或跳过的用户ID
  const interactedUsers = await db
    .select({ userId: userLikes.toUserId })
    .from(userLikes)
    .where(eq(userLikes.fromUserId, currentUserId));
  
  const interactedUserIds = interactedUsers.map(u => u.userId);
  
  // 基本筛选条件
  let whereConditions = [
    eq(users.isActive, true),
    eq(users.isEmailVerified, true),
    eq(userProfiles.isProfileComplete, true),
    isNull(users.deletedAt),
    ne(users.id, currentUserId)
  ];
  
  // 排除已互动用户
  if (interactedUserIds.length > 0) {
    whereConditions.push(notInArray(users.id, interactedUserIds));
  }

  // 应用筛选条件
  if (filters.gender && filters.gender !== 'all') {
    whereConditions.push(eq(userProfiles.gender, filters.gender as 'male' | 'female' | 'other'));
  }

  if (filters.minAge !== undefined) {
    whereConditions.push(gte(userProfiles.age, filters.minAge));
  }

  if (filters.maxAge !== undefined) {
    whereConditions.push(lte(userProfiles.age, filters.maxAge));
  }

  if (filters.studyHabit && filters.studyHabit.length > 0) {
    whereConditions.push(inArray(userProfiles.studyHabit, filters.studyHabit as ('early_bird' | 'night_owl' | 'flexible')[]));
  }

  if (filters.lifestyle && filters.lifestyle.length > 0) {
    whereConditions.push(inArray(userProfiles.lifestyle, filters.lifestyle as ('quiet' | 'social' | 'balanced')[]));
  }

  if (filters.cleanliness && filters.cleanliness.length > 0) {
    whereConditions.push(inArray(userProfiles.cleanliness, filters.cleanliness as ('very_clean' | 'clean' | 'moderate')[]));
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

export async function getAvailableTeams(userId: number, limit = 20) {
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
    isNull(teams.deletedAt)
  ];
  
  if (excludeTeamIds.length > 0) {
    conditions.push(notInArray(teams.id, excludeTeamIds));
  }
  
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