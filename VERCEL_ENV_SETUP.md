# Vercel环境变量配置指南

## 紧急修复Supabase连接问题

### 1. 在Vercel项目设置中添加以下环境变量：

访问 [Vercel Dashboard](https://vercel.com/dashboard) → 选择项目 → Settings → Environment Variables

**必需添加的环境变量：**

```bash
# 数据库连接（最重要）
POSTGRES_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.your-project.supabase.co:5432/postgres

# 基础URL（改为你的Vercel域名）
BASE_URL=https://roommate-matching-system.vercel.app

# 认证密钥
AUTH_SECRET=your-auth-secret-key-here

# 邮件服务配置
MAIL_SERVER=smtp.exmail.qq.com
MAIL_PORT=465
MAIL_USERNAME=your-email@stu.ecnu.edu.cn
MAIL_PASSWORD=YOUR_EMAIL_PASSWORD
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your-email@stu.ecnu.edu.cn
```

### 2. 检查Supabase项目状态

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 检查项目 `wxvnzmgegotkikfurywf` 是否处于活跃状态
3. 如果项目被暂停，需要重新激活或使用新的数据库

### 3. 可能的解决方案

#### 方案A: 使用Supabase连接池
如果直接连接失败，尝试使用连接池URL：
```bash
POSTGRES_URL=postgresql://postgres:YOUR_DB_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

#### 方案B: 创建新的Supabase项目
1. 在Supabase创建新项目
2. 更新`POSTGRES_URL`为新项目的连接字符串
3. 运行数据库迁移：`npm run db:migrate`

### 4. 验证步骤

在Vercel部署后，检查函数日志：
- 查看是否有数据库连接成功的日志
- 确认所有环境变量已正确设置

### 5. 常见错误诊断

- `ENOTFOUND` 错误 → DNS解析失败，检查连接字符串
- `ECONNREFUSED` 错误 → 端口或SSL配置问题
- `timeout` 错误 → 网络延迟，增加超时时间

## 部署后立即测试

部署完成后访问：`https://your-domain.vercel.app/api/auth/login`