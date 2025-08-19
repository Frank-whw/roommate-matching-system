export const siteConfig = {
  name: "RoomieSync",
  title: "RoomieSync - 智能室友匹配平台",
  description: "基于AI算法的新一代室友匹配神器，让找室友变得简单而有趣！",
  slogan: "遇见最佳室友，开启精彩校园生活",
  version: "1.0.0"
};

export const authConfig = {
  // JWT令牌过期时间
  sessionExpiresIn: '1 day',

  // 邮箱验证令牌过期时间 (10分钟)
  emailVerificationExpiresIn: 10 * 60 * 1000, // 10 minutes in milliseconds

  // 支持的教育邮箱域名
  allowedEmailDomains: [
    '@stu.ecnu.edu.cn'
  ],

  // 学号格式正则表达式 (102555015XX)
  studentIdPattern: /^102555015\d{2}$/,

  // 密码强度要求
  passwordRequirements: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false
  }
};