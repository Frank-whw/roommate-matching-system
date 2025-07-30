# 🚀 云端部署指南

本指南将帮助您将室友匹配系统部署到云端，包括数据库迁移和完整的生产环境配置。

## 📋 目录

1. [部署前准备](#部署前准备)
2. [数据库迁移](#数据库迁移)
3. [云平台选择](#云平台选择)
4. [Vercel 部署（推荐）](#vercel-部署推荐)
5. [其他平台部署](#其他平台部署)
6. [环境变量配置](#环境变量配置)
7. [域名和SSL配置](#域名和ssl配置)
8. [监控和维护](#监控和维护)

---

## 🔧 部署前准备

### 1. 检查项目完整性

```bash
# 确保所有依赖已安装
npm install

# 确保项目可以正常构建
npm run build

# 确保数据库连接正常
npm run db:setup
```

### 2. 环境变量准备

创建生产环境的环境变量列表：

```bash
# 数据库连接
POSTGRES_URL=postgresql://username:password@host:port/database

# 应用配置
BASE_URL=https://your-domain.com
AUTH_SECRET=your-super-secret-key-for-production
NODE_ENV=production

# 邮件服务配置
MAIL_SERVER=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=noreply@your-domain.com
```

---

## 🗄️ 数据库迁移

### 选项 1: Supabase（推荐 - 免费额度）

**优势：**
- 免费额度：500MB存储，50MB数据库
- 自动备份和扩展
- 内置RealtimeAL功能
- 内置认证系统
- 简单的Web界面管理

**步骤：**

1. **注册 Supabase**
   ```bash
   # 访问 https://supabase.com
   # 创建新项目
   ```

2. **获取数据库连接信息**
   ```bash
   # 在 Supabase Dashboard -> Settings -> Database
   # 复制 Connection string
   ```

3. **配置环境变量**
   ```bash
   POSTGRES_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

4. **运行迁移**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # 可选：初始化数据
   ```

### 选项 2: Railway

**优势：**
- $5/月起步价格
- 一键部署GitHub项目
- 自动SSL证书
- 内置数据库服务

**步骤：**

1. **连接GitHub仓库**
   - 访问 railway.app
   - 连接您的GitHub仓库

2. **添加PostgreSQL服务**
   - 在Railway项目中添加PostgreSQL插件
   - 复制连接字符串

3. **配置环境变量**
   ```bash
   POSTGRES_URL=${{Postgres.DATABASE_URL}}
   ```

### 选项 3: Neon（无需服务器）

**优势：**
- Serverless PostgreSQL
- 自动休眠和唤醒
- 3GB免费存储
- 分支功能支持

**步骤：**

1. **创建Neon项目**
   ```bash
   # 访问 https://neon.tech
   # 创建新数据库
   ```

2. **配置连接**
   ```bash
   POSTGRES_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require
   ```

### 选项 4: 阿里云RDS（国内推荐）

**优势：**
- 国内访问速度快
- 完善的监控和备份
- 高可用性配置
- 支持读写分离

**步骤：**

1. **购买RDS实例**
   - 选择PostgreSQL引擎
   - 配置规格（最低1核1G）
   
2. **配置网络**
   - 设置白名单IP
   - 创建数据库和用户

3. **连接字符串**
   ```bash
   POSTGRES_URL=postgresql://username:password@hostname.rds.aliyuncs.com:5432/database
   ```

---

## ☁️ 云平台选择

### Vercel（推荐）

**优势：**
- 免费部署
- 自动SSL证书
- 全球CDN
- 与GitHub完美集成
- 适合Next.js项目

**限制：**
- Serverless函数10秒超时
- 免费版有请求限制

### Railway

**优势：**
- 支持长期运行进程
- 内置数据库
- 简单的环境管理
- 支持Docker部署

**价格：**
- $5/月起步

### 阿里云/腾讯云

**优势：**
- 国内访问速度快
- 完整的云服务生态
- 企业级支持

**考虑因素：**
- 需要备案（使用自定义域名）
- 相对复杂的配置

---

## 🌐 Vercel 部署（推荐）

### 1. 准备部署

```bash
# 安装 Vercel CLI（可选）
npm i -g vercel

# 登录 Vercel
vercel login
```

### 2. 配置项目

在项目根目录创建 `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 3. 部署步骤

**方法A: 通过Vercel Dashboard（推荐）**

1. 访问 https://vercel.com
2. 点击 "Import Project"
3. 连接GitHub并选择您的仓库
4. 配置环境变量（见下方）
5. 点击 "Deploy"

**方法B: 命令行部署**

```bash
# 首次部署
vercel

# 后续部署
git push origin main  # Vercel会自动部署
```

### 4. 配置环境变量

在Vercel Dashboard中配置：

```bash
# 必需变量
POSTGRES_URL=your_database_connection_string
BASE_URL=https://your-app.vercel.app
AUTH_SECRET=your-production-secret-key

# 邮件配置
MAIL_SERVER=smtp.qq.com
MAIL_PORT=587
MAIL_USERNAME=your_email@qq.com
MAIL_PASSWORD=your_email_auth_code
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=noreply@your-domain.com
```

### 5. 数据库部署后设置

```bash
# 本地运行迁移到生产数据库
POSTGRES_URL=your_production_db_url npm run db:migrate

# 或者使用生产环境的迁移
# 在Vercel Functions中触发迁移
```

---

## 🔧 其他平台部署

### Railway 部署

1. **连接仓库**
   - 访问 railway.app
   - 连接GitHub仓库

2. **添加服务**
   ```bash
   # 添加PostgreSQL数据库
   # 系统自动提供DATABASE_URL
   ```

3. **环境变量**
   ```bash
   POSTGRES_URL=${{Postgres.DATABASE_URL}}
   BASE_URL=https://your-app.railway.app
   AUTH_SECRET=your-secret-key
   ```

### 腾讯云Serverless部署

```bash
# 安装Serverless CLI
npm i -g serverless

# 配置serverless.yml
# 部署
sls deploy
```

### Docker部署（自定义服务器）

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# 构建并部署
docker build -t roommate-matching .
docker run -d -p 3000:3000 --env-file .env roommate-matching
```

---

## ⚙️ 环境变量配置

### 完整环境变量模板

```bash
# ===========================================
# 生产环境配置模板
# ===========================================

# 数据库连接（必需）
POSTGRES_URL=postgresql://username:password@host:port/database

# 应用基础配置（必需）
BASE_URL=https://your-domain.com
AUTH_SECRET=your-super-secret-production-key-min-32-chars
NODE_ENV=production

# 邮件服务配置（推荐）
MAIL_SERVER=smtp.qq.com
MAIL_PORT=587
MAIL_USERNAME=your_email@qq.com
MAIL_PASSWORD=your_email_authorization_code
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=noreply@your-domain.com

# 可选配置
NEXT_PUBLIC_APP_NAME=室友匹配系统
NEXT_PUBLIC_APP_VERSION=1.0.0

# 安全配置
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key  # 如果使用验证码
```

### 安全注意事项

1. **AUTH_SECRET 生成**
   ```bash
   # 生成安全的密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **数据库连接安全**
   - 使用SSL连接
   - 限制IP访问
   - 定期更换密码

3. **邮件安全**
   - 使用应用专用密码
   - 不要使用个人邮箱主密码
   - 启用两步验证

---

## 🌍 域名和SSL配置

### 1. 域名配置

**Vercel:**
```bash
# 在Vercel Dashboard中：
# 1. 进入项目设置
# 2. 点击 "Domains"
# 3. 添加自定义域名
# 4. 配置DNS记录
```

**DNS配置:**
```bash
# A记录（如果使用A记录）
Type: A
Name: @
Value: 76.76.19.61  # Vercel IP

# CNAME记录（推荐）
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 2. SSL证书

大部分云平台（Vercel、Railway等）会自动提供免费的SSL证书。

---

## 📊 监控和维护

### 1. 应用监控

```bash
# 使用Vercel Analytics
# 在vercel.json中添加：
{
  "analytics": {
    "id": "your-analytics-id"
  }
}
```

### 2. 数据库监控

- 定期备份数据库
- 监控连接数和性能
- 设置告警机制

### 3. 日志监控

```bash
# Vercel Functions日志
# Railway应用日志
# 云服务商监控面板
```

### 4. 定期维护

```bash
# 更新依赖包
npm audit fix

# 数据库优化
VACUUM ANALYZE;  # PostgreSQL

# 监控磁盘空间和内存使用
```

---

## 🔄 CI/CD自动化

### GitHub Actions示例

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📞 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查连接字符串格式
   - 验证网络连接
   - 确认数据库服务状态

2. **邮件发送失败**
   - 检查邮件服务器配置
   - 验证授权码/密码
   - 查看邮件服务商限制

3. **构建失败**
   - 检查依赖版本
   - 查看构建日志
   - 验证环境变量

4. **404错误**
   - 检查路由配置
   - 验证构建输出
   - 查看部署日志

---

## 💡 最佳实践建议

### 1. 安全性
- 使用HTTPS
- 定期更新依赖
- 实施访问控制
- 监控安全漏洞

### 2. 性能
- 启用CDN
- 优化图片资源
- 使用缓存策略
- 监控响应时间

### 3. 可靠性
- 设置健康检查
- 实施错误监控
- 配置备份策略
- 准备灾难恢复

### 4. 用户体验
- 优化加载速度
- 提供离线支持
- 实施渐进式加载
- 支持多设备访问

---

## 📋 部署检查清单

- [ ] 数据库已创建并配置
- [ ] 环境变量已设置
- [ ] 邮件服务已测试
- [ ] 域名DNS已配置
- [ ] SSL证书已启用
- [ ] 应用监控已设置
- [ ] 备份策略已实施
- [ ] 错误日志已配置
- [ ] 性能监控已启用
- [ ] 安全扫描已通过

恭喜！您的室友匹配系统现在可以为用户提供服务了！🎉