// 统一验证schemas

import { z } from 'zod';

// 基础验证规则
export const VALIDATION_RULES = {
  // 学号验证
  STUDENT_ID: /^102\d55014\d{2}$/,
  
  // 密码验证
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false // 设为false，因为当前系统没有要求特殊字符
  },
  
  // 时间格式
  TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  
  // 微信号验证
  WECHAT_ID: /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/,
  
  // 长度限制
  LENGTHS: {
    NAME: { min: 2, max: 50 },
    WECHAT: { min: 6, max: 20 },
    BIO: { max: 500 },
    EXPECTATIONS: { max: 1000 },
    HOBBIES: { max: 500 },
    DEAL_BREAKERS: { max: 500 },
    TEAM_NAME: { min: 2, max: 100 },
    TEAM_DESCRIPTION: { max: 100 },
    MESSAGE: { max: 200 }
  }
};

// 自定义错误消息
const MESSAGES = {
  REQUIRED: '此字段为必填项',
  INVALID_EMAIL: '请输入有效的邮箱地址',
  INVALID_STUDENT_ID: '学号格式不正确，应为102*55014**格式',
  INVALID_PASSWORD: '密码格式不符合要求',
  INVALID_TIME: '时间格式不正确，应为HH:mm格式',
  INVALID_WECHAT: '微信号格式不正确，应以字母开头，6-20位字母数字下划线组合',
  TOO_SHORT: (min: number) => `至少需要${min}个字符`,
  TOO_LONG: (max: number) => `不能超过${max}个字符`,
  INVALID_AGE: '年龄应在16-35岁之间',
  PASSWORD_MISMATCH: '两次输入的密码不一致',
  AGREE_REQUIRED: '请同意用户协议和隐私政策'
};

// 基础字段验证
export const baseValidation = {
  studentId: z.string()
    .regex(VALIDATION_RULES.STUDENT_ID, MESSAGES.INVALID_STUDENT_ID),
    
  email: z.string()
    .email(MESSAGES.INVALID_EMAIL),
    
  password: z.string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, MESSAGES.TOO_SHORT(VALIDATION_RULES.PASSWORD.MIN_LENGTH))
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/\d/, '密码必须包含至少一个数字'),
    
  name: z.string()
    .min(VALIDATION_RULES.LENGTHS.NAME.min, MESSAGES.TOO_SHORT(VALIDATION_RULES.LENGTHS.NAME.min))
    .max(VALIDATION_RULES.LENGTHS.NAME.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.NAME.max)),
    
  wechatId: z.string()
    .regex(VALIDATION_RULES.WECHAT_ID, MESSAGES.INVALID_WECHAT)
    .optional(),
    
  age: z.number()
    .int()
    .min(16, MESSAGES.INVALID_AGE)
    .max(35, MESSAGES.INVALID_AGE)
    .optional(),
    
  time: z.string()
    .regex(VALIDATION_RULES.TIME_FORMAT, MESSAGES.INVALID_TIME)
    .optional(),
    
  bio: z.string()
    .max(VALIDATION_RULES.LENGTHS.BIO.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.BIO.max))
    .optional()
};

// 认证相关schemas
export const authSchemas = {
  register: z.object({
    studentId: baseValidation.studentId,
    agreeToTerms: z.boolean()
      .refine(val => val === true, MESSAGES.AGREE_REQUIRED)
  }),
  
  login: z.object({
    studentId: baseValidation.studentId,
    password: z.string().min(1, '密码不能为空')
  }),
  
  setPassword: z.object({
    token: z.string().min(1, 'Token不能为空'),
    password: baseValidation.password,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmPassword']
  }),
  
  verifyEmail: z.object({
    token: z.string().min(1, 'Token不能为空')
  })
};

// 个人资料schemas
export const profileSchemas = {
  updateProfile: z.object({
    // 基本信息
    wechatId: baseValidation.wechatId,
    gender: z.enum(['male', 'female', 'other']).optional(),
    age: baseValidation.age,
    
    // 作息习惯
    sleepTime: baseValidation.time,
    wakeTime: baseValidation.time,
    studyHabit: z.enum(['library', 'dormitory', 'flexible']).optional(),
    
    // 生活习惯
    lifestyle: z.enum(['quiet', 'social', 'balanced']).optional(),
    cleanliness: z.enum(['extremely_clean', 'regularly_tidy', 'acceptable']).optional(),
    mbti: z.enum([
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP',
      'unknown'
    ]).optional(),
    
    // 室友期待和兴趣
    roommateExpectations: z.string()
      .max(VALIDATION_RULES.LENGTHS.EXPECTATIONS.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.EXPECTATIONS.max))
      .optional(),
    hobbies: z.string()
      .max(VALIDATION_RULES.LENGTHS.HOBBIES.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.HOBBIES.max))
      .optional(),
    dealBreakers: z.string()
      .max(VALIDATION_RULES.LENGTHS.DEAL_BREAKERS.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.DEAL_BREAKERS.max))
      .optional(),
    
    // 个人简介
    bio: baseValidation.bio
  })
};

// 队伍相关schemas
export const teamSchemas = {
  createTeam: z.object({
    name: z.string()
      .min(VALIDATION_RULES.LENGTHS.TEAM_NAME.min, MESSAGES.TOO_SHORT(VALIDATION_RULES.LENGTHS.TEAM_NAME.min))
      .max(VALIDATION_RULES.LENGTHS.TEAM_NAME.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.TEAM_NAME.max)),
    description: z.string()
      .max(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max))
      .optional(),
    maxMembers: z.number()
      .int()
      .min(2, '队伍最少需要2人')
      .max(4, '队伍最多4人')
      .default(4),
    requirements: z.string()
      .max(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max))
      .optional()
  }),
  
  updateTeam: z.object({
    teamId: z.number().int().positive(),
    name: z.string()
      .min(VALIDATION_RULES.LENGTHS.TEAM_NAME.min, MESSAGES.TOO_SHORT(VALIDATION_RULES.LENGTHS.TEAM_NAME.min))
      .max(VALIDATION_RULES.LENGTHS.TEAM_NAME.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.TEAM_NAME.max))
      .optional(),
    description: z.string()
      .max(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max))
      .optional(),
    maxMembers: z.number()
      .int()
      .min(2, '队伍最少需要2人')
      .max(4, '队伍最多4人')
      .optional(),
    requirements: z.string()
      .max(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.TEAM_DESCRIPTION.max))
      .optional()
  }),
  
  joinTeam: z.object({
    teamId: z.number().int().positive(),
    message: z.string()
      .max(VALIDATION_RULES.LENGTHS.MESSAGE.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.MESSAGE.max))
      .optional()
  }),
  
  reviewRequest: z.object({
    requestId: z.number().int().positive(),
    action: z.enum(['approve', 'reject']),
    rejectReason: z.string()
      .max(VALIDATION_RULES.LENGTHS.MESSAGE.max, MESSAGES.TOO_LONG(VALIDATION_RULES.LENGTHS.MESSAGE.max))
      .optional()
  })
};

// 匹配相关schemas
export const matchSchemas = {
  likeUser: z.object({
    targetUserId: z.number().int().positive()
  }),
  
  unmatchUser: z.object({
    matchId: z.number().int().positive()
  })
};

// 通用schemas
export const commonSchemas = {
  id: z.number().int().positive(),
  pagination: z.object({
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0)
  }),
  filters: z.object({
    gender: z.enum(['male', 'female', 'other']).optional(),
    mbti: z.enum([
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ]).optional(),
    studyHabit: z.enum(['library', 'dormitory', 'flexible']).optional(),
    lifestyle: z.enum(['quiet', 'social', 'balanced']).optional()
  })
};