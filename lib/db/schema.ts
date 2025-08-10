import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const mbtiEnum = pgEnum('mbti', [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]);
export const studyHabitEnum = pgEnum('study_habit', ['library', 'dormitory', 'flexible']);
export const lifestyleEnum = pgEnum('lifestyle', ['quiet', 'social', 'balanced']);
export const cleanlinessEnum = pgEnum('cleanliness', ['extremely_clean', 'regularly_tidy', 'acceptable']);
export const teamStatusEnum = pgEnum('team_status', ['recruiting', 'full', 'disbanded']);
export const matchStatusEnum = pgEnum('match_status', ['pending', 'matched', 'rejected']);

// Users table - 用户基本信息表
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  studentId: varchar('student_id', { length: 20 }).notNull().unique(), // 学号 102*55014**格式
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true), // 账户激活状态
  isEmailVerified: boolean('is_email_verified').notNull().default(false), // 邮箱验证状态
  emailVerificationToken: varchar('email_verification_token', { length: 255 }), // 邮箱验证令牌
  emailVerificationExpires: timestamp('email_verification_expires'), // 令牌过期时间
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  studentIdIdx: index('student_id_idx').on(table.studentId),
}));

// User profiles table - 用户详细资料表
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  nickname: varchar('nickname', { length: 50 }), // 昵称，如：Frank
  wechatId: varchar('wechat_id', { length: 100 }), // 微信号
  gender: genderEnum('gender'),
  age: integer('age'),
  
  // 作息习惯
  sleepTime: varchar('sleep_time', { length: 10 }), // 睡觉时间，格式：22:00
  wakeTime: varchar('wake_time', { length: 10 }), // 起床时间，格式：07:00
  studyHabit: studyHabitEnum('study_habit'), // 学习习惯
  
  // 生活习惯
  lifestyle: lifestyleEnum('lifestyle'), // 生活方式
  cleanliness: cleanlinessEnum('cleanliness'), // 清洁习惯
  mbti: mbtiEnum('mbti'), // MBTI性格类型
  
  // 室友期待
  roommateExpectations: text('roommate_expectations'), // 室友期待描述
  hobbies: text('hobbies'), // 爱好兴趣
  dealBreakers: text('deal_breakers'), // 不能接受的行为
  
  // 其他
  bio: text('bio'), // 个人简介
  isProfileComplete: boolean('is_profile_complete').notNull().default(false), // 资料完整度
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('profile_user_id_idx').on(table.userId),
}));

// Teams table - 队伍表
export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(), // 队伍名称
  description: text('description'), // 队伍描述
  leaderId: integer('leader_id')
    .notNull()
    .references(() => users.id), // 队长ID
  gender: genderEnum('gender'), // 队伍性别（基于队长性别）
  maxMembers: integer('max_members').notNull().default(4), // 最大成员数
  currentMembers: integer('current_members').notNull().default(1), // 当前成员数
  status: teamStatusEnum('status').notNull().default('recruiting'), // 队伍状态
  requirements: text('requirements'), // 招募要求
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  leaderIdIdx: index('team_leader_id_idx').on(table.leaderId),
  statusIdx: index('team_status_idx').on(table.status),
  genderIdx: index('team_gender_idx').on(table.gender), // 添加性别索引以优化查询
}));

// Team members table - 队伍成员表
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  isLeader: boolean('is_leader').notNull().default(false), // 是否为队长
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => ({
  teamIdIdx: index('team_member_team_id_idx').on(table.teamId),
  userIdIdx: index('team_member_user_id_idx').on(table.userId),
  // 确保一个用户只能在一个队伍中
  uniqueUserTeam: index('unique_user_team_idx').on(table.userId),
}));

// Team join requests table - 入队申请表
export const teamJoinRequests = pgTable('team_join_requests', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id, { onDelete: 'cascade' }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: text('message'), // 申请留言
  status: matchStatusEnum('status').notNull().default('pending'), // 申请状态
  reviewedBy: integer('reviewed_by')
    .references(() => users.id), // 审核人（队长）
  reviewedAt: timestamp('reviewed_at'), // 审核时间
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  teamIdIdx: index('join_request_team_id_idx').on(table.teamId),
  userIdIdx: index('join_request_user_id_idx').on(table.userId),
  statusIdx: index('join_request_status_idx').on(table.status),
}));

// User likes table - 互喜表（用户间的点赞关系）
export const userLikes = pgTable('user_likes', {
  id: serial('id').primaryKey(),
  fromUserId: integer('from_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  toUserId: integer('to_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  isLike: boolean('is_like').notNull().default(true), // true为喜欢，false为不喜欢
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  fromUserIdx: index('like_from_user_id_idx').on(table.fromUserId),
  toUserIdx: index('like_to_user_id_idx').on(table.toUserId),
  // 确保每对用户之间只能有一个点赞记录
  uniqueUserPair: index('unique_user_pair_like_idx').on(table.fromUserId, table.toUserId),
}));

// Matches table - 匹配结果表（双向喜欢后的匹配记录）
export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  user1Id: integer('user1_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  user2Id: integer('user2_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  matchScore: integer('match_score'), // 匹配度评分 (0-100)
  status: matchStatusEnum('status').notNull().default('matched'), // 匹配状态
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  user1Idx: index('match_user1_id_idx').on(table.user1Id),
  user2Idx: index('match_user2_id_idx').on(table.user2Id),
  statusIdx: index('match_status_idx').on(table.status),
}));

// Activity logs table - 活动日志表（保留原有功能但扩展用于室友匹配系统）
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: text('metadata'), // JSON field for additional data
}, (table) => ({
  userIdIdx: index('activity_log_user_id_idx').on(table.userId),
  actionIdx: index('activity_log_action_idx').on(table.action),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  activityLogs: many(activityLogs),
  teamMemberships: many(teamMembers),
  teamsAsLeader: many(teams),
  joinRequests: many(teamJoinRequests),
  likesGiven: many(userLikes, { relationName: 'likesGiven' }),
  likesReceived: many(userLikes, { relationName: 'likesReceived' }),
  matchesAsUser1: many(matches, { relationName: 'matchesAsUser1' }),
  matchesAsUser2: many(matches, { relationName: 'matchesAsUser2' }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  leader: one(users, {
    fields: [teams.leaderId],
    references: [users.id],
  }),
  members: many(teamMembers),
  joinRequests: many(teamJoinRequests),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const teamJoinRequestsRelations = relations(teamJoinRequests, ({ one }) => ({
  team: one(teams, {
    fields: [teamJoinRequests.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamJoinRequests.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [teamJoinRequests.reviewedBy],
    references: [users.id],
    relationName: 'reviewer',
  }),
}));

export const userLikesRelations = relations(userLikes, ({ one }) => ({
  fromUser: one(users, {
    fields: [userLikes.fromUserId],
    references: [users.id],
    relationName: 'likesGiven',
  }),
  toUser: one(users, {
    fields: [userLikes.toUserId],
    references: [users.id],
    relationName: 'likesReceived',
  }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: 'matchesAsUser1',
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: 'matchesAsUser2',
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type TeamJoinRequest = typeof teamJoinRequests.$inferSelect;
export type NewTeamJoinRequest = typeof teamJoinRequests.$inferInsert;
export type UserLike = typeof userLikes.$inferSelect;
export type NewUserLike = typeof userLikes.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

// Activity types enum (扩展原有的活动类型)
export enum ActivityType {
  // 用户相关
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  
  // 匹配相关
  LIKE_USER = 'LIKE_USER',
  PASS_USER = 'PASS_USER',
  MATCH_SUCCESS = 'MATCH_SUCCESS',
  UNMATCH = 'UNMATCH',
  
  // 队伍相关
  CREATE_TEAM = 'CREATE_TEAM',
  JOIN_TEAM = 'JOIN_TEAM',
  LEAVE_TEAM = 'LEAVE_TEAM',
  REQUEST_JOIN_TEAM = 'REQUEST_JOIN_TEAM',
  APPROVE_JOIN_REQUEST = 'APPROVE_JOIN_REQUEST',
  REJECT_JOIN_REQUEST = 'REJECT_JOIN_REQUEST',
  BECOME_TEAM_LEADER = 'BECOME_TEAM_LEADER',
  DISBAND_TEAM = 'DISBAND_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
}