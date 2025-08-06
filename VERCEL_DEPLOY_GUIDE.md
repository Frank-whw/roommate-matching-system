# Vercel 部署指南

## 🚀 快速部署步骤

### 1. 准备工作

确保您已经有以下账户：
- [Vercel 账户](https://vercel.com)
- 数据库服务（推荐 [Supabase](https://supabase.com) 或 [Neon](https://neon.tech)）
- 邮箱服务（QQ邮箱、163邮箱等）

### 2. 部署到 Vercel

#### 方法一：通过 GitHub（推荐）

1. 将代码推送到 GitHub 仓库
2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择您的 GitHub 仓库
5. 点击 "Deploy"

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel
```

### 3. 配置环境变量

**重要：** 部署后必须在 Vercel 控制台中配置环境变量，否则登录/注册功能将无法使用。

1. 在 Vercel Dashboard 中选择您的项目
2. 进入 **Settings** → **Environment Variables**
3. 添加以下环境变量：

#### 必需的环境变量

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `POSTGRES_URL` | `postgresql://user:pass@host:5432/db` | 数据库连接字符串 |
| `AUTH_SECRET` | `your-32-char-secret-key` | JWT 签名密钥（至少32字符） |
| `BASE_URL` | `https://your-app.vercel.app` | 应用的完整 URL |
| `MAIL_SERVER` | `smtp.qq.com` | SMTP 服务器地址 |
| `MAIL_PORT` | `587` | SMTP 端口 |
| `MAIL_USERNAME` | `your@email.com` | 邮箱用户名 |
| `MAIL_PASSWORD` | `your-auth-code` | 邮箱授权码 |
| `MAIL_FROM_NAME` | `RoomieSync` | 发件人名称 |
| `MAIL_FROM_ADDRESS` | `your@email.com` | 发件人邮箱 |

#### 生成 AUTH_SECRET

```bash
# 方法1：使用 OpenSSL
openssl rand -base64 32

# 方法2：使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. 数据库设置

#### 使用 Supabase（推荐）

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目
3. 在 **Settings** → **Database** 中找到连接字符串
4. 格式：`postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### 使用 Neon

1. 登录 [Neon](https://neon.tech)
2. 创建新项目
3. 复制连接字符串
4. 格式：`postgresql://[user]:[password]@[endpoint]/[dbname]?sslmode=require`

### 5. 邮件服务配置

#### QQ 邮箱配置

1. 登录 QQ 邮箱
2. 进入 **设置** → **账户**
3. 开启 **POP3/SMTP服务**
4. 获取授权码（不是登录密码）

配置示例：
```
MAIL_SERVER=smtp.qq.com
MAIL_PORT=587
MAIL_USERNAME=your@qq.com
MAIL_PASSWORD=your-auth-code
```

#### 163 邮箱配置

```
MAIL_SERVER=smtp.163.com
MAIL_PORT=25
MAIL_USERNAME=your@163.com
MAIL_PASSWORD=your-auth-code
```

### 6. 部署后验证

1. **检查部署状态**
   - 在 Vercel Dashboard 查看部署日志
   - 确认构建成功

2. **测试功能**
   - 访问您的应用 URL
   - 尝试注册新用户
   - 检查邮件发送
   - 测试登录功能

3. **查看日志**
   ```bash
   # 使用 Vercel CLI 查看实时日志
   vercel logs
   ```

### 7. 常见问题解决

#### 登录/注册不工作

1. 检查环境变量是否正确设置
2. 验证数据库连接
3. 确认 AUTH_SECRET 已设置

#### 邮件发送失败

1. 检查邮箱授权码
2. 验证 SMTP 服务器配置
3. 确认邮箱服务已开启 SMTP

#### 数据库连接错误

1. 检查数据库 URL 格式
2. 确认数据库允许外部连接
3. 验证用户名和密码

### 8. 性能优化

#### 数据库优化

1. 添加适当的索引
2. 使用连接池
3. 优化查询语句

#### Vercel 配置优化

1. 配置适当的区域（推荐 `hkg1` 香港）
2. 设置合理的函数超时时间
3. 启用缓存策略

### 9. 监控和维护

1. **设置监控**
   - 配置 Vercel 部署通知
   - 监控应用性能
   - 设置错误报告

2. **定期维护**
   - 更新依赖包
   - 备份数据库
   - 检查安全更新

### 10. 故障排除

如果遇到问题，请参考 [VERCEL_TROUBLESHOOTING.md](./VERCEL_TROUBLESHOOTING.md) 获取详细的故障排除指南。

---

## 🔧 本地开发

如果需要在本地开发，请：

1. 复制 `.env.example` 为 `.env`
2. 填写相应的环境变量
3. 运行 `npm run dev`

## 📞 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [项目故障排除指南](./VERCEL_TROUBLESHOOTING.md)