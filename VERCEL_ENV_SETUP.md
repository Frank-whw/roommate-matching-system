# Vercel环境变量配置指南

## 🚨 紧急修复：Tenant or user not found (XX000)

错误代码 `XX000` 表示Supabase项目或认证有问题。

### 🔥 立即解决步骤：

#### 1. 检查Supabase项目状态
访问 [Supabase Dashboard](https://supabase.com/dashboard)：
- 确认项目 `zbpyawwealsugnvkmlon` 是否存在且活跃
- 检查项目是否被暂停（显示"Paused"状态）
- 如果项目被删除，需要创建新项目

#### 2. 重置数据库密码
在Supabase Dashboard中：
1. 进入项目设置 → Database
2. 点击"Reset database password"
3. 生成新密码
4. 更新Vercel中的 `POSTGRES_URL`

#### 3. 获取正确的连接字符串
在Supabase项目中：
1. Settings → Database → Connection string → URI
2. 复制完整的连接字符串
3. 确保包含正确的密码

### 📋 Vercel环境变量配置：

**使用新的连接字符串：**
```bash
# 从Supabase Dashboard复制的完整连接字符串
POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# 或者如果项目暂停，使用连接池：
POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# 其他必需变量
BASE_URL=https://roommate-matching-system.vercel.app
AUTH_SECRET=your-auth-secret-key-here
MAIL_SERVER=smtp.exmail.qq.com
MAIL_PORT=465
MAIL_USERNAME=your-email@stu.ecnu.edu.cn
MAIL_PASSWORD=YOUR_EMAIL_PASSWORD
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your-email@stu.ecnu.edu.cn
```

### 🆘 如果项目已删除，创建新项目：

1. **在Supabase创建新项目**
2. **获取新的连接字符串**
3. **更新Vercel环境变量**
4. **运行数据库初始化**：
   ```bash
   # 本地运行迁移
   npm run db:migrate
   npm run db:seed
   ```

### 🔍 诊断工具

部署后访问调试端点检查连接状态：
```
https://your-domain.vercel.app/api/debug/db-connection
```

### ⚠️ 常见XX000错误原因：

1. **项目已暂停** → 重新激活或升级计划
2. **密码不正确** → 重置数据库密码
3. **项目已删除** → 创建新项目
4. **区域不匹配** → 确认使用正确的区域连接字符串
5. **IP限制** → 检查数据库访问设置

### 🎯 快速验证步骤：

1. [ ] 确认Supabase项目活跃
2. [ ] 重置并更新数据库密码
3. [ ] 更新Vercel环境变量
4. [ ] 重新部署
5. [ ] 访问调试API确认连接成功
6. [ ] 测试用户注册功能

---
**💡 提示**: XX000是Supabase特有的错误，通常表示项目认证失败。重置密码和确认项目状态是最有效的解决方案。