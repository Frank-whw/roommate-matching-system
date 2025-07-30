'use server';

import { z } from 'zod';
import { eq, and, or } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { userLikes, matches, ActivityType } from '@/lib/db/schema';
import { getCurrentUser, logActivity } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

// 点赞操作schema
const likeActionSchema = z.object({
  targetUserId: z.number().int().positive('目标用户ID不正确'),
  isLike: z.boolean()
});

export async function likeUser(rawData: any) {
  try {
    // 获取当前用户
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // 验证数据
    const result = likeActionSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { targetUserId, isLike } = result.data;

    // 检查是否是自己
    if (currentUserId === targetUserId) {
      return { error: '不能对自己进行操作' };
    }

    // 检查是否已经对该用户进行过操作
    const existingLike = await db
      .select()
      .from(userLikes)
      .where(
        and(
          eq(userLikes.fromUserId, currentUserId),
          eq(userLikes.toUserId, targetUserId)
        )
      )
      .limit(1);

    if (existingLike.length > 0) {
      return { error: '您已经对该用户进行过操作' };
    }

    // 记录用户操作
    await db.insert(userLikes).values({
      fromUserId: currentUserId,
      toUserId: targetUserId,
      isLike: isLike
    });

    // 记录活动日志
    await logActivity(
      currentUserId, 
      isLike ? ActivityType.LIKE_USER : ActivityType.PASS_USER,
      undefined,
      { targetUserId }
    );

    let matchCreated = false;
    let matchId = null;

    // 如果是喜欢操作，检查是否形成互喜
    if (isLike) {
      const reciprocalLike = await db
        .select()
        .from(userLikes)
        .where(
          and(
            eq(userLikes.fromUserId, targetUserId),
            eq(userLikes.toUserId, currentUserId),
            eq(userLikes.isLike, true)
          )
        )
        .limit(1);

      // 如果对方也喜欢，创建匹配记录
      if (reciprocalLike.length > 0) {
        // 检查是否已经有匹配记录
        const existingMatch = await db
          .select()
          .from(matches)
          .where(
            or(
              and(
                eq(matches.user1Id, currentUserId),
                eq(matches.user2Id, targetUserId)
              ),
              and(
                eq(matches.user1Id, targetUserId),
                eq(matches.user2Id, currentUserId)
              )
            )
          )
          .limit(1);

        if (existingMatch.length === 0) {
          // 创建新的匹配记录
          const newMatch = await db.insert(matches).values({
            user1Id: Math.min(currentUserId, targetUserId), // 小的ID作为user1
            user2Id: Math.max(currentUserId, targetUserId), // 大的ID作为user2
            status: 'matched'
          }).returning();

          matchCreated = true;
          matchId = newMatch[0].id;

          // 记录匹配活动日志
          await Promise.all([
            logActivity(currentUserId, ActivityType.MATCH_SUCCESS, undefined, { 
              matchId: matchId, 
              partnerId: targetUserId 
            }),
            logActivity(targetUserId, ActivityType.MATCH_SUCCESS, undefined, { 
              matchId: matchId, 
              partnerId: currentUserId 
            })
          ]);
        }
      }
    }

    // 重新验证相关页面
    revalidatePath('/explore');
    revalidatePath('/matches');

    return {
      success: true,
      message: isLike ? '点赞成功！' : '已跳过该用户',
      matchCreated,
      matchId,
      action: isLike ? 'like' : 'pass'
    };

  } catch (error) {
    console.error('用户操作失败:', error);
    return {
      error: '操作失败，请重试'
    };
  }
}

// 获取用户的匹配列表
export async function getUserMatches() {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // 查询用户的所有匹配
    const userMatches = await db
      .select({
        match: matches,
        // 这里需要join来获取匹配用户的信息，但为了简化先返回基本数据
      })
      .from(matches)
      .where(
        or(
          eq(matches.user1Id, currentUserId),
          eq(matches.user2Id, currentUserId)
        )
      );

    return {
      success: true,
      matches: userMatches
    };

  } catch (error) {
    console.error('获取匹配列表失败:', error);
    return {
      error: '获取匹配列表失败'
    };
  }
}

// 取消匹配
const unmatchSchema = z.object({
  matchId: z.number().int().positive('匹配ID不正确')
});

export async function unmatchUser(rawData: any) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return { error: '用户未登录' };
    }

    const currentUserId = user.users.id;

    // 验证数据
    const result = unmatchSchema.safeParse(rawData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const { matchId } = result.data;

    // 检查匹配是否存在且用户有权限操作
    const matchRecord = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.id, matchId),
          or(
            eq(matches.user1Id, currentUserId),
            eq(matches.user2Id, currentUserId)
          )
        )
      )
      .limit(1);

    if (matchRecord.length === 0) {
      return { error: '匹配记录不存在或您没有权限操作' };
    }

    // 删除匹配记录（软删除，更新状态）
    await db
      .update(matches)
      .set({ 
        status: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(matches.id, matchId));

    // 记录活动日志
    const partnerId = matchRecord[0].user1Id === currentUserId 
      ? matchRecord[0].user2Id 
      : matchRecord[0].user1Id;

    await logActivity(currentUserId, ActivityType.UNMATCH, undefined, { 
      matchId, 
      partnerId 
    });

    revalidatePath('/matches');

    return {
      success: true,
      message: '已取消匹配'
    };

  } catch (error) {
    console.error('取消匹配失败:', error);
    return {
      error: '取消匹配失败，请重试'
    };
  }
}