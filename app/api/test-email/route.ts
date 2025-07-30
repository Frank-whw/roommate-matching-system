import { NextRequest, NextResponse } from 'next/server';
import { sendTestEmail, isValidEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // 验证邮箱格式
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: '请提供有效的邮箱地址'
      }, { status: 400 });
    }

    // 检查邮件配置
    const isConfigured = isEmailConfigured();
    
    // 发送测试邮件
    const success = await sendTestEmail(email);

    if (success) {
      return NextResponse.json({
        success: true,
        message: isConfigured 
          ? '测试邮件发送成功！请检查您的邮箱（包括垃圾邮件文件夹）' 
          : '邮件服务未配置，使用模拟模式。请检查控制台输出。'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '测试邮件发送失败。请检查邮件服务器配置。'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('邮件测试API错误:', error);
    
    return NextResponse.json({
      success: false,
      message: '服务器内部错误，请稍后重试'
    }, { status: 500 });
  }
}