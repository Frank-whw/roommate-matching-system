import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserWithProfile, generateEmailFromStudentId } from '@/lib/db/queries';

// 强制动态渲染
export const dynamic = 'force-dynamic';

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

    const { id } = params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const targetUser = await getUserWithProfile(userId);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 返回用户信息（隐藏敏感信息）
    const email = generateEmailFromStudentId(targetUser.users.studentId);
    const safeUserData = {
      id: targetUser.users.id,
      name: targetUser.users.name,
      email: email ? email.replace(/(.{2}).*(@.*)/, '$1***$2') : null,
      studentId: targetUser.users.studentId ? targetUser.users.studentId.replace(/(.{3}).*(.{2})/, '$1***$2') : null,
      profile: targetUser.user_profiles ? {
        ...targetUser.user_profiles,
        wechatId: undefined, // 隐藏微信号
      } : null,
      createdAt: targetUser.users.createdAt,
      isEmailVerified: targetUser.users.isEmailVerified
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