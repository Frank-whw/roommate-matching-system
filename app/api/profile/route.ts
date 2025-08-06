import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getUserProfileData } from '@/lib/db/queries';
import { updateProfile } from '@/app/profile/actions';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// 获取当前用户的完整个人资料
export async function GET() {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await getUserProfileData(user.users.id);
    
    // 检查个人资料完整性
    const isProfileComplete = profileData && 
      profileData.wechatId && 
      profileData.gender && 
      profileData.age && 
      profileData.sleepTime && 
      profileData.wakeTime && 
      profileData.studyHabit && 
      profileData.lifestyle && 
      profileData.cleanliness && 
      profileData.mbti && 
      profileData.roommateExpectations && 
      profileData.hobbies;
    
    return NextResponse.json({
      success: true,
      isProfileComplete: !!isProfileComplete,
      data: {
        user: user.users,
        profile: profileData
      }
    });

  } catch (error) {
    console.error('获取个人资料失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新当前用户的个人资料
export async function PUT(request: NextRequest) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.users) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = await updateProfile(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        profile: result.profile,
        completionPercentage: result.completionPercentage
      }
    });

  } catch (error) {
    console.error('更新个人资料失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}