# Vercel 部署故障排除指南

## 常见问题及解决方案

### 1. 登录/注册功能无法使用

#### 可能原因：
- 环境变量未正确配置
- 数据库连接问题
- Cookie 设置问题
- AUTH_SECRET 未设置

#### 解决步骤：

1. **检查环境变量**
   ```bash
   npm run check:env
   ```

2. **在 Vercel 控制台设置环境变量**
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择您的项目
   - 进入 Settings → Environment Variables
   - 添加以下必需变量：

   ```
   POSTGRES_URL=postgresql://username:password@host:port/database
   AUTH_SECRET=your-super-secret-key-at-least-32-characters
   BASE_URL=https://your-app.vercel.app
   MAIL_SERVER=smtp.qq.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@qq.com
   MAIL_PASSWORD=your_email_auth_code
   MAIL_FROM_NAME=RoomieSync
   MAIL_FROM_ADDRESS=your_email@qq.com
   ```

3. **生成强 AUTH_SECRET**
   ```bash
   # 在终端中运行
   openssl rand -base64 32
   ```

4. **检查数据库连接**
   - 确保数据库允许来自 Vercel 的连接
   - 检查数据库 URL 格式是否正确
   - 确认数据库表已创建

### 2. 数据库连接问题

#### 症状：
- API 请求返回 500 错误
- 控制台显示数据库连接错误

#### 解决方案：

1. **检查数据库提供商设置**
   - **Neon**: 确保允许来自任何 IP 的连接
   - **Supabase**: 检查网络限制设置
   - **PlanetScale**: 确认连接字符串格式

2. **更新连接字符串**
   ```
   # 标准格式
   postgresql://username:password@host:port/database?sslmode=require
   
   # 如果使用连接池
   postgresql://username:password@host:port/database?pgbouncer=true&sslmode=require
   ```

### 3. 邮件发送问题

#### 症状：
- 注册后收不到邮件
- 邮件发送 API 返回错误

#### 解决方案：

1. **检查邮件服务配置**
   - 确认 SMTP 服务器地址和端口
   - 验证邮箱授权码（不是登录密码）

2. **常用邮件服务配置**
   ```
   # QQ 邮箱
   MAIL_SERVER=smtp.qq.com
   MAIL_PORT=587
   
   # 163 邮箱
   MAIL_SERVER=smtp.163.com
   MAIL_PORT=25
   
   # Gmail
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   ```

### 4. 部署后页面空白或错误

#### 可能原因：
- 构建错误
- 环境变量缺失
- 静态文件路径问题

#### 解决步骤：

1. **查看 Vercel 构建日志**
   - 在 Vercel Dashboard 中查看部署详情
   - 检查构建和运行时错误

2. **本地测试生产构建**
   ```bash
   npm run build
   npm start
   ```

3. **检查 Next.js 配置**
   - 确认 `next.config.js` 配置正确
   - 检查是否有路径相关问题

### 5. API 路由超时

#### 症状：
- API 请求超时
- 504 Gateway Timeout 错误

#### 解决方案：

1. **优化数据库查询**
   - 添加适当的索引
   - 优化复杂查询
   - 使用连接池

2. **调整 Vercel 函数配置**
   - 检查 `vercel.json` 中的 `maxDuration` 设置
   - 考虑升级 Vercel 计划以获得更长的执行时间

## 调试工具

### 1. 环境变量检查
```bash
npm run check:env
```

### 2. 查看 Vercel 日志
```bash
# 安装 Vercel CLI
npm i -g vercel

# 查看实时日志
vercel logs
```

### 3. 本地调试
```bash
# 使用生产环境变量本地运行
vercel dev
```

## 联系支持

如果以上步骤都无法解决问题，请：

1. 收集错误信息：
   - Vercel 部署日志
   - 浏览器控制台错误
   - 网络请求详情

2. 检查项目配置：
   - 环境变量截图（隐藏敏感信息）
   - 数据库连接状态
   - 邮件服务测试结果

3. 提供复现步骤：
   - 详细描述问题发生的步骤
   - 预期行为 vs 实际行为
   - 错误发生的频率

## 预防措施

1. **定期备份**
   - 定期备份数据库
   - 保存环境变量配置

2. **监控设置**
   - 设置 Vercel 部署通知
   - 监控应用性能和错误率

3. **测试流程**
   - 部署前在本地测试生产构建
   - 使用 staging 环境测试
   - 验证关键功能正常工作