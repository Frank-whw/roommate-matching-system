'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { userProfiles } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

// 个人资料更新schema
const profileSchema = z.object({
  // 基本信息
  nickname: z.string().min(2, '昵称至少需要2个字符').max(50, '昵称不能超过50个字符').optional(),
  wechatId: z.string().max(100, '微信号不能超过100个字符').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().int().min(16, '年龄不能小于16').max(35, '年龄不能大于35').optional(),
  
  // 作息习惯
  sleepTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '睡觉时间格式不正确').optional(),
  wakeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, '起床时间格式不正确').optional(),
  studyHabit: z.enum(['library', 'dormitory', 'flexible']).optional(),
  
  // 生活习惯
  lifestyle: z.enum(['quiet', 'social', 'balanced']).optional(),
  cleanliness: z.enum(['extremely_clean', 'regularly_tidy', 'acceptable']).optional(),
  mbti: z.enum([
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]).optional(),
  
  // 室友期待和兴趣
  roommateExpectations: z.string().max(1000, '室友期待不能超过1000个字符').optional(),
  hobbies: z.string().max(500, '兴趣爱好不能超过500个字符').optional(),
  dealBreakers: z.string().max(500, '不可接受行为不能超过500个字符').optional(),
  
  // 个人简介
  bio: z.string().max(500, '个人简介不能超过500个字符').optional(),
});

export async function updateProfile(rawData: any) {
  try {
    // 获取当前用户
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    // 验证数据
    const result = profileSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }
    
    const data = result.data;
    const currentUser = user.users;
    
    // 检查用户是否已有profile记录
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, currentUser.id))
      .limit(1);

    // 计算资料完整度
    const requiredFields = [
      data.nickname, data.wechatId, data.gender, data.age,
      data.sleepTime, data.wakeTime, data.studyHabit,
      data.lifestyle, data.cleanliness, data.mbti,
      data.roommateExpectations, data.hobbies
    ];
    
    const completedFields = requiredFields.filter(field => field !== undefined && field !== '').length;
    const isProfileComplete = completedFields >= 8; // 至少需要完成8个重要字段

    const profileData = {
      ...data,
      isProfileComplete,
      updatedAt: new Date()
    };

    let result_data;
    
    if (existingProfile.length > 0) {
      // 更新现有profile
      result_data = await db
        .update(userProfiles)
        .set(profileData)
        .where(eq(userProfiles.userId, currentUser.id))
        .returning();
    } else {
      // 创建新profile，使用ON CONFLICT处理可能的并发问题
      try {
        result_data = await db
          .insert(userProfiles)
          .values({
            userId: currentUser.id,
            ...profileData
          })
          .returning();
      } catch (insertError: any) {
        // 如果插入失败（可能是并发导致的重复），尝试更新
        if (insertError.code === '23505') {
          result_data = await db
            .update(userProfiles)
            .set(profileData)
            .where(eq(userProfiles.userId, currentUser.id))
            .returning();
        } else {
          throw insertError;
        }
      }
    }

    // 重新验证页面缓存
    revalidatePath('/profile');

    return {
      success: true,
      message: '个人资料已成功更新！',
      profile: result_data[0],
      completionPercentage: Math.round((completedFields / requiredFields.length) * 100)
    };

  } catch (error) {
    console.error('更新个人资料时出错:', error);
    return {
      error: '更新失败，请重试'
    };
  }
}

// 获取当前用户的详细资料
export async function getUserProfile() {
  const { user } = await getCurrentUser();
  
  if (!user) {
    return { error: '用户未登录' };
  }

  return {
    success: true,
    user: user
  };
}