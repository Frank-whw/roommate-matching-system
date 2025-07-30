// 邮箱发送功能（使用真实的邮件服务器）
import nodemailer from 'nodemailer';
import { authConfig } from '@/lib/config';

interface EmailOptions {
  to: string;
  subject: string;
  content: string;
  token?: string;
}

// 创建邮件传输器
function createTransporter() {
  const {
    MAIL_SERVER,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
    MAIL_FROM_NAME,
    MAIL_FROM_ADDRESS
  } = process.env;

  if (!MAIL_SERVER || !MAIL_USERNAME || !MAIL_PASSWORD) {
    console.warn('邮件配置不完整，将使用模拟模式');
    return null;
  }

  return nodemailer.createTransporter({
    host: MAIL_SERVER,
    port: parseInt(MAIL_PORT || '587'),
    secure: parseInt(MAIL_PORT || '587') === 465, // true for 465, false for other ports
    auth: {
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD,
    },
    // 支持自签名证书
    tls: {
      rejectUnauthorized: false
    }
  });
}

// 发送邮件主函数
export async function sendEmail({ to, subject, content }: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    // 如果没有配置邮件服务器，使用模拟模式
    if (!transporter) {
      console.log('===== 模拟邮件发送 =====');
      console.log('收件人:', to);
      console.log('主题:', subject);
      console.log('内容:', content);
      console.log('============================');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    const { MAIL_FROM_NAME, MAIL_FROM_ADDRESS } = process.env;

    // 发送真实邮件
    const info = await transporter.sendMail({
      from: `"${MAIL_FROM_NAME || '室友匹配系统'}" <${MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
      to: to,
      subject: subject,
      html: content,
      // 同时提供文本版本
      text: content.replace(/<[^>]*>/g, '') // 简单的HTML标签移除
    });

    console.log('邮件发送成功:', info.messageId);
    return true;

  } catch (error) {
    console.error('邮件发送失败:', error);
    
    // 在开发环境下，如果邮件发送失败，仍然返回true以便测试
    if (process.env.NODE_ENV === 'development') {
      console.log('开发环境：邮件发送失败，但返回成功以便测试');
      return true;
    }
    
    return false;
  }
}

// 发送邮箱验证邮件
export async function sendEmailVerification(email: string, token: string, studentId: string): Promise<boolean> {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;
  
  const subject = '室友匹配系统 - 邮箱验证';
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 邮箱验证</h1>
        </div>
        <div class="content">
          <p>尊敬的同学（学号：<strong>${studentId}</strong>），</p>
          <p>感谢您注册<strong>室友匹配系统</strong>！</p>
          <p>请点击以下按钮完成邮箱验证（链接10分钟内有效）：</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">验证邮箱</a>
          </p>
          <p>如果按钮无法点击，请复制以下链接到浏览器地址栏访问：</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">
            ${verificationUrl}
          </p>
          <p>如果您没有注册室友匹配系统，请忽略此邮件。</p>
          <p class="footer">
            祝您找到理想室友！<br>
            <strong>室友匹配系统团队</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    content,
    token
  });
}

// 发送设置密码邮件
export async function sendPasswordSetupEmail(email: string, token: string, studentId: string): Promise<boolean> {
  const passwordSetupUrl = `${process.env.BASE_URL}/set-password?token=${token}`;
  
  const subject = '室友匹配系统 - 设置密码';
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .footer { color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 设置密码</h1>
        </div>
        <div class="content">
          <p>尊敬的同学（学号：<strong>${studentId}</strong>），</p>
          <p>感谢您注册<strong>室友匹配系统</strong>！</p>
          <p>您的邮箱已验证成功，现在请设置您的登录密码（链接10分钟内有效）：</p>
          <p style="text-align: center;">
            <a href="${passwordSetupUrl}" class="button">设置密码</a>
          </p>
          <p>如果按钮无法点击，请复制以下链接到浏览器地址栏访问：</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">
            ${passwordSetupUrl}
          </p>
          <p>如果您没有注册室友匹配系统，请忽略此邮件。</p>
          <p class="footer">
            祝您找到理想室友！<br>
            <strong>室友匹配系统团队</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    content,
    token
  });
}

// 发送匹配成功通知邮件
export async function sendMatchNotification(email: string, matchedUserName: string): Promise<boolean> {
  const subject = '室友匹配系统 - 🎉 匹配成功通知';
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .celebration { font-size: 2em; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 匹配成功！</h1>
        </div>
        <div class="content">
          <div class="celebration">🎊 恭喜恭喜！ 🎊</div>
          <p>太棒了！您与 <strong>${matchedUserName}</strong> 互相匹配成功！</p>
          <p>现在您可以：</p>
          <ul>
            <li>查看对方的详细资料信息</li>
            <li>通过系统进行进一步沟通</li>
            <li>交流室友生活的相关话题</li>
          </ul>
          <p style="text-align: center;">
            <a href="${process.env.BASE_URL}/matches" class="button">查看匹配结果</a>
          </p>
          <p style="background: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            💡 <strong>小贴士：</strong>建议您尽快与对方取得联系，进行更深入的了解，为成为室友做好准备！
          </p>
          <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
            祝您们成为最佳室友！<br>
            <strong>室友匹配系统团队</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    content
  });
}

// 发送队伍邀请通知邮件
export async function sendTeamInvitation(email: string, teamName: string, inviterName: string): Promise<boolean> {
  const subject = '室友匹配系统 - 队伍邀请';
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .team-info { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👥 队伍邀请</h1>
        </div>
        <div class="content">
          <p>您收到了一个队伍邀请！</p>
          <div class="team-info">
            <p><strong>👤 邀请人：</strong>${inviterName}</p>
            <p><strong>🏠 队伍名：</strong>「${teamName}」</p>
          </div>
          <p>${inviterName} 认为您非常适合加入他们的队伍，一起寻找理想的住宿伙伴。</p>
          <p style="text-align: center;">
            <a href="${process.env.BASE_URL}/teams" class="button">查看邀请详情</a>
          </p>
          <p style="background: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444;">
            ⏰ <strong>温馨提醒：</strong>请及时查看并回复邀请，让对方知道您的想法！
          </p>
          <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
            <strong>室友匹配系统团队</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    content
  });
}

// 测试邮件发送功能
export async function sendTestEmail(email: string): Promise<boolean> {
  const subject = '室友匹配系统 - 邮件服务测试';
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ 邮件服务测试</h1>
        </div>
        <div class="content">
          <p>恭喜！如果您收到这封邮件，说明邮件服务配置成功！</p>
          <p><strong>测试时间：</strong>${new Date().toLocaleString('zh-CN')}</p>
          <p><strong>收件人：</strong>${email}</p>
          <p>现在您可以正常使用室友匹配系统的所有邮件功能了。</p>
          <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
            <strong>室友匹配系统团队</strong>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    content
  });
}

// 验证邮箱地址格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证是否为教育邮箱
export function isEducationalEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  return authConfig.allowedEmailDomains.some(domain => emailLower.endsWith(domain));
}

// 获取邮箱域名
export function getEmailDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

// 检查邮件配置是否完整
export function isEmailConfigured(): boolean {
  const {
    MAIL_SERVER,
    MAIL_USERNAME,
    MAIL_PASSWORD
  } = process.env;

  return !!(MAIL_SERVER && MAIL_USERNAME && MAIL_PASSWORD);
}