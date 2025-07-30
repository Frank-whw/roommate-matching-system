// 邮箱发送功能（开发环境模拟）
import { authConfig } from '@/lib/config';

interface EmailOptions {
  to: string;
  subject: string;
  content: string;
  token?: string;
}

// 模拟邮件发送（在实际环境中，这里应该集成真正的邮件服务商如SendGrid、阿里云等）
export async function sendEmail({ to, subject, content }: EmailOptions): Promise<boolean> {
  try {
    // 在开发环境中，我们只是将邮件信息记录到控制台
    console.log('===== 模拟邮件发送 =====');
    console.log('收件人:', to);
    console.log('主题:', subject);
    console.log('内容:', content);
    console.log('============================');
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 在实际环境中，这里应该返回真实的发送结果
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
}

// 发送邮箱验证邮件
export async function sendEmailVerification(email: string, token: string, studentId: string): Promise<boolean> {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;
  
  const subject = '室友匹配系统 - 邮箱验证';
  const content = `
    <h2>邮箱验证</h2>
    <p>尊敬的同学（学号：${studentId}），</p>
    <p>感谢您注册室友匹配系统！</p>
    <p>请点击以下链接完成邮箱验证（链接10分钟内有效）：</p>
    <p><a href="${verificationUrl}" style="color: #007bff; text-decoration: none;">${verificationUrl}</a></p>
    <p>如果无法点击链接，请复制以上网址到浏览器地址栏访问。</p>
    <p>如果您没有注册室友匹配系统，请忽略此邮件。</p>
    <br>
    <p>祝您找到理想室友！</p>
    <p>室友匹配系统团队</p>
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
    <h2>设置密码</h2>
    <p>尊敬的同学（学号：${studentId}），</p>
    <p>感谢您注册室友匹配系统！</p>
    <p>请点击以下链接设置您的登录密码（链接10分钟内有效）：</p>
    <p><a href="${passwordSetupUrl}" style="color: #007bff; text-decoration: none;">${passwordSetupUrl}</a></p>
    <p>如果无法点击链接，请复制以上网址到浏览器地址栏访问。</p>
    <p>如果您没有注册室友匹配系统，请忽略此邮件。</p>
    <br>
    <p>祝您找到理想室友！</p>
    <p>室友匹配系统团队</p>
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
  const subject = '室友匹配系统 - 匹配成功通知';
  const content = `
    <h2>🎉 匹配成功！</h2>
    <p>恭喜！您与 ${matchedUserName} 互相匹配成功！</p>
    <p>您可以登录系统查看对方的详细信息并进行进一步沟通。</p>
    <p><a href="${process.env.BASE_URL}/matches" style="color: #007bff; text-decoration: none;">查看匹配结果</a></p>
    <br>
    <p>祝您们成为好室友！</p>
    <p>室友匹配系统团队</p>
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
    <h2>队伍邀请</h2>
    <p>您收到一个队伍邀请！</p>
    <p>${inviterName} 邀请您加入队伍「${teamName}」</p>
    <p>请登录系统查看详细信息并回复邀请。</p>
    <p><a href="${process.env.BASE_URL}/teams" style="color: #007bff; text-decoration: none;">查看邀请</a></p>
    <br>
    <p>室友匹配系统团队</p>
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