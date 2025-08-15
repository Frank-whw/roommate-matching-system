import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 清除会话Cookie
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json({
      success: true,
      message: '已成功退出登录'
    });

  } catch (error) {
    console.error('退出登录失败:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}