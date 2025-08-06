# Vercel环境变量配置指南

## 🚨 紧急修复Supabase连接问题

根据最新错误 `db.your-project.supabase.co`，需要更新环境变量。

### 1. 在Vercel项目设置中更新环境变量：

访问 [Vercel Dashboard](https://vercel.com/dashboard) → 选择项目 → Settings → Environment Variables

**必需更新的环境变量：**

```bash
# 数据库连接（使用新的Supabase项目ID）
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:5432/postgres

# 基础URL（改为你的实际Vercel域名）
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

### 2. 🔧 自动连接池优化

代码已更新，在生产环境会自动尝试使用Supabase连接池：
- 直接连接：`db.your-project.supabase.co:5432`
- 连接池：`aws-0-ap-southeast-1.pooler.supabase.com:6543`

### 3. 🐛 调试API端点

部署后可访问以下端点调试连接问题：
```
https://your-domain.vercel.app/api/debug/db-connection
```

### 4. 📝 检查清单

- [ ] 在Vercel中添加所有环境变量
- [ ] 确认`POSTGRES_URL`使用正确的项目ID (`zbpyawwealsugnvkmlon`)
- [ ] 更新`BASE_URL`为实际Vercel域名
- [ ] 重新部署项目
- [ ] 访问调试API检查连接状态

### 5. 🚀 可能的连接字符串格式

如果直接连接仍然失败，尝试以下格式：

#### 选项A：连接池URL
```bash
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

#### 选项B：IPv6支持
```bash
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:5432/postgres?sslmode=require
```

#### 选项C：完整参数
```bash
POSTGRES_URL=postgresql://postgres:YOUR_PASSWORD@db.your-project.supabase.co:5432/postgres?sslmode=require&connect_timeout=60
```

### 6. ⚠️ 常见问题

**ENOTFOUND错误**：
- 确认Supabase项目处于活跃状态
- 检查项目ID是否正确：`zbpyawwealsugnvkmlon`
- 尝试使用连接池URL

**超时错误**：
- 连接超时已增加到60秒
- Vercel函数执行时间限制为10秒（Hobby）/15秒（Pro）

### 7. 📞 立即测试步骤

1. 更新Vercel环境变量
2. 触发重新部署
3. 访问 `/api/debug/db-connection` 查看连接信息
4. 尝试注册新用户测试功能

---

**重要提醒**: 替换 `YOUR_PASSWORD` 为实际的数据库密码！