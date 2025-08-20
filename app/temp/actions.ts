'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  users,
  userProfiles,
  type NewUser,
  type NewUserProfile,
  ActivityType,
} from '@/lib/db/schema';
import {
  hashPassword,
  validateStudentId,
  setSession,
} from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getUserByStudentId, createUser, logActivity } from '@/lib/db/queries';
import { validatedAction } from '@/lib/auth/middleware';

// 临时注册schema
const tempRegisterSchema = z.object({
  studentId: z.string()
    .regex(/^10255501\d{3}$/, '学号格式不正确，应为10255501XXX格式'),
  password: z.string()
    .min(8, '密码至少需要8位')
    .max(100, '密码不能超过100位'),
  name: z.string()
    .min(1, '请输入用户名')
    .max(50, '用户名不能超过50个字符'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: '请选择性别'
  })
});

export const tempRegister = validatedAction(tempRegisterSchema, async (data) => {
  const { studentId, password, name, gender } = data;

  try {
    // 检查学号是否已被注册
    const existingUser = await getUserByStudentId(studentId);
    if (existingUser) {
      return {
        error: '该学号已被注册',
        field: 'studentId'
      };
    }

    // 哈希密码
    const passwordHash = await hashPassword(password);

    // 创建用户记录
    const newUser: NewUser = {
      studentId,
      passwordHash,
      name,
      isActive: true,  // 直接激活
      isEmailVerified: true,  // 临时注册直接设为已验证，跳过邮箱验证流程
      emailVerificationToken: null,
      emailVerificationExpires: null
    };

    const createdUser = await createUser(newUser);

    if (!createdUser) {
      return {
        error: '注册失败，请重试',
      };
    }

    // 创建用户资料记录
    const newUserProfile: NewUserProfile = {
      userId: createdUser.id,
      gender,
      isProfileComplete: false  // 需要完善其他资料
    };

    await db.insert(userProfiles).values(newUserProfile);

    // 记录活动日志
    await logActivity(createdUser.id, ActivityType.SIGN_UP);

    // 自动登录
    await setSession({
      ...createdUser,
      studentId: createdUser.studentId,
      isEmailVerified: createdUser.isEmailVerified
    });

    return {
      success: true,
      message: '注册成功！已自动登录，现在可以完善个人资料开始匹配室友了。'
    };

  } catch (error) {
    console.error('临时注册过程出错:', error);
    return {
      error: '注册失败，请重试',
    };
  }
});