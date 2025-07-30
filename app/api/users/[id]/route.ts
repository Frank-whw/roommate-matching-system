import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserWithProfile } from '@/lib/db/queries';
import { z } from 'zod';

// 获取特定用户的详细信息
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const targetUser = await getUserWithProfile(userId);
    
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 返回用户信息（隐藏敏感信息）
    const safeUserData = {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email ? targetUser.email.replace(/(.{2}).*(@.*)/, '$1***$2') : null,
      studentId: targetUser.studentId ? targetUser.studentId.replace(/(.{3}).*(.{2})/, '$1***$2') : null,
      profile: targetUser.userProfiles ? {
        ...targetUser.userProfiles,
        wechatId: undefined, // 隐藏微信号
      } : null,
      createdAt: targetUser.createdAt,
      isEmailVerified: targetUser.isEmailVerified
    };

    return NextResponse.json({
      success: true,
      data: safeUserData
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}