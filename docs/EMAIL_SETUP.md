# 📧 邮件服务配置指南

本文档将指导您如何配置室友匹配系统的邮件发送功能。

## 🔧 环境变量配置

在项目根目录的 `.env` 文件中添加以下配置：

```bash
# 邮件服务器配置
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password_or_auth_code
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your_email@example.com
```

## 📮 常用邮件服务商配置

### 1. QQ 邮箱
```bash
MAIL_SERVER=smtp.qq.com
MAIL_PORT=587
MAIL_USERNAME=your_qq_number@qq.com
MAIL_PASSWORD=your_authorization_code  # 需要开启SMTP服务获取授权码
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your_qq_number@qq.com
```

**QQ邮箱设置步骤：**
1. 登录QQ邮箱 → 设置 → 账户
2. 找到"POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务"
3. 开启"IMAP/SMTP服务"
4. 发送短信验证后获取授权码
5. 使用授权码作为密码

### 2. 163 邮箱
```bash
MAIL_SERVER=smtp.163.com
MAIL_PORT=25  # 或 465
MAIL_USERNAME=your_username@163.com
MAIL_PASSWORD=your_authorization_code  # 需要开启SMTP服务获取授权码
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your_username@163.com
```

### 3. Gmail
```bash
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password  # 需要启用两步验证并生成应用密码
MAIL_FROM_NAME=Roommate Matching System
MAIL_FROM_ADDRESS=your_email@gmail.com
```

**Gmail设置步骤：**
1. 启用两步验证
2. 生成应用专用密码
3. 使用应用密码而非账户密码

### 4. Outlook/Hotmail
```bash
MAIL_SERVER=smtp.live.com
MAIL_PORT=587
MAIL_USERNAME=your_email@outlook.com
MAIL_PASSWORD=your_account_password
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your_email@outlook.com
```

### 5. 阿里云邮箱
```bash
MAIL_SERVER=smtp.mxhichina.com
MAIL_PORT=25
MAIL_USERNAME=your_email@yourdomain.com
MAIL_PASSWORD=your_account_password
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your_email@yourdomain.com
```

## 🧪 测试邮件功能

1. 完成邮件配置后，访问 `/test-email` 页面
2. 输入测试邮箱地址
3. 点击"发送测试邮件"
4. 检查邮箱是否收到测试邮件

## 📝 邮件模板

系统包含以下邮件模板：

### 1. 邮箱验证邮件
- 发送时机：用户注册时
- 内容：包含验证链接（10分钟有效）
- 模板：美观的HTML格式，包含学号和验证按钮

### 2. 设置密码邮件  
- 发送时机：邮箱验证成功后
- 内容：包含设置密码链接（10分钟有效）
- 模板：引导用户完成密码设置

### 3. 匹配成功通知
- 发送时机：两个用户互相喜欢时
- 内容：庆祝匹配成功，引导查看匹配结果
- 模板：欢庆主题设计

### 4. 队伍邀请通知
- 发送时机：收到队伍邀请时
- 内容：显示邀请人和队伍信息
- 模板：橙色主题，强调及时回复

## 🔍 故障排除

### 常见问题

**1. 邮件发送失败 - 认证错误**
- 确认用户名和密码正确
- 对于QQ/163邮箱，确保使用授权码而非登录密码
- 对于Gmail，确保使用应用专用密码

**2. 邮件发送失败 - 连接超时**
- 检查防火墙设置
- 确认邮件服务器地址和端口正确
- 尝试使用不同的端口（25, 465, 587）

**3. 邮件发送成功但收不到**
- 检查垃圾邮件/垃圾箱文件夹
- 确认收件邮箱地址正确
- 检查邮件服务商的发送限制

**4. SSL/TLS 错误**
- 确保使用正确的端口
- 端口465通常使用SSL，端口587通常使用TLS

### 调试模式

在开发环境中，如果邮件配置不完整或发送失败，系统会：
1. 在控制台输出邮件内容（模拟模式）
2. 返回成功状态以便继续测试其他功能
3. 记录详细的错误日志

### 生产环境建议

1. **安全性**
   - 不要在代码中硬编码邮件密码
   - 使用环境变量存储敏感信息
   - 定期更换邮件服务密码

2. **可靠性**
   - 建议使用专业的邮件服务提供商（如SendGrid、阿里云邮件推送等）
   - 配置邮件发送失败的重试机制
   - 监控邮件发送成功率

3. **合规性**
   - 确保邮件内容符合反垃圾邮件法规
   - 提供退订链接（如需要）
   - 遵循邮件发送频率限制

## 🚀 高级配置

### 使用专业邮件服务

对于生产环境，建议使用专业邮件服务：

1. **SendGrid**
2. **阿里云邮件推送**
3. **腾讯云邮件推送**
4. **AWS SES**

这些服务通常提供：
- 更高的送达率
- 详细的发送统计
- 反垃圾邮件优化
- API接口支持

### 邮件队列

对于高并发场景，可以考虑：
1. 使用邮件队列系统（如Redis + Bull）
2. 实现异步邮件发送
3. 添加发送失败重试机制

## 📞 技术支持

如果在配置过程中遇到问题，可以：
1. 查看控制台日志输出
2. 使用 `/test-email` 页面进行测试
3. 检查邮件服务商的帮助文档
4. 提交Issue到项目仓库