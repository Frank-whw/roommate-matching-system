export const siteConfig = {
  name: "室友匹配系统",
  title: "室友匹配系统 - 找到理想室友", 
  description: "基于Next.js构建的智能室友匹配平台。"
};

export const authConfig = {
  // JWT令牌过期时间
  sessionExpiresIn: '1 day',
  
  // 邮箱验证令牌过期时间 (10分钟)
  emailVerificationExpiresIn: 10 * 60 * 1000, // 10 minutes in milliseconds
  
  // 支持的教育邮箱域名
  allowedEmailDomains: [
    '@edu.cn',
    '@stu.edu.cn',
    '@student.edu.cn',
    '@mail.edu.cn'
  ],
  
  // 学号格式正则表达式 (102*55014**)
  studentIdPattern: /^102\d55014\d{2}$/,
  
  // 密码强度要求
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  }
};