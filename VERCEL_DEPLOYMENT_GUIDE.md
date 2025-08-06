# Vercel 部署指南

## 环境变量配置

在 Vercel 项目控制台的 `Settings` → `Environment Variables` 中添加以下环境变量：

### 必需的环境变量：

1. **数据库连接**
   ```
   POSTGRES_URL=your-database-connection-string
   ```

2. **认证密钥**
   ```
   AUTH_SECRET=your-secret-key
   ```
   可以使用以下命令生成：
   ```bash
   openssl rand -base64 32
   ```

3. **基础URL**
   ```
   BASE_URL=https://your-vercel-app-domain.vercel.app
   ```

4. **邮件服务配置**
   ```
   MAIL_SERVER=your-smtp-server
   MAIL_PORT=587
   MAIL_USERNAME=your-email
   MAIL_PASSWORD=your-email-password
   MAIL_FROM_NAME=RoomieSync
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

## 部署步骤

1. Fork 或克隆此仓库
2. 在 Vercel 中导入项目
3. 配置上述环境变量
4. 部署应用

## 数据库设置

如果使用新的数据库：

1. 运行数据库迁移：
   ```bash
   npm run db:migrate
   ```

2. 种子数据（可选）：
   ```bash
   npm run db:seed
   ```

## 故障排除

### 连接数据库失败
- 检查 `POSTGRES_URL` 环境变量是否正确
- 确保数据库服务器允许外部连接
- 检查防火墙设置

### 邮件发送失败
- 验证邮件服务器配置
- 检查邮箱密码或应用专用密码
- 确保 SMTP 端口正确

### 认证问题
- 确保 `AUTH_SECRET` 已设置
- 检查 `BASE_URL` 是否匹配 Vercel 域名