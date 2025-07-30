# 🚀 室友匹配系统 - 快速云端部署指南

> 30分钟内完成从零到生产环境的完整部署

## 📋 部署检查清单

- [ ] 1. [准备数据库](#1-准备数据库) (5分钟)
- [ ] 2. [配置环境变量](#2-配置环境变量) (5分钟) 
- [ ] 3. [部署应用](#3-部署应用) (10分钟)
- [ ] 4. [配置邮件服务](#4-配置邮件服务) (5分钟)
- [ ] 5. [验证部署](#5-验证部署) (5分钟)

---

## 🎯 1. 准备数据库

### 👍 推荐：Supabase (免费)

1. **注册账号**: 访问 [supabase.com](https://supabase.com) 
2. **创建项目**: 点击 "New Project"
3. **获取连接信息**:
   ```bash
   # 在 Settings -> Database 找到 Connection string
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 🔄 替代方案：Neon, Railway, 阿里云RDS

<details>
<summary>点击查看其他数据库选项</summary>

**Neon (Serverless PostgreSQL):**
- 访问 [neon.tech](https://neon.tech)
- 3GB免费额度
- 自动休眠/唤醒

**Railway:**
- 访问 [railway.app](https://railway.app) 
- $5/月起
- 集成部署服务

**阿里云RDS:**
- 访问阿里云控制台
- 国内访问速度快
- 需要备案

</details>

---

## ⚙️ 2. 配置环境变量

### 创建生产环境变量

```bash
# 基础配置 (必需)
POSTGRES_URL=your_database_connection_string
BASE_URL=https://your-app-domain.com
AUTH_SECRET=your-32-char-random-secret-key

# 邮件服务 (推荐)
MAIL_SERVER=smtp.qq.com
MAIL_PORT=587
MAIL_USERNAME=your_email@qq.com
MAIL_PASSWORD=your_email_authorization_code
MAIL_FROM_NAME=室友匹配系统
MAIL_FROM_ADDRESS=your_email@qq.com
```

### 🔐 生成安全密钥

```bash
# 生成AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 📧 QQ邮箱授权码获取

1. 登录QQ邮箱 → 设置 → 账户
2. 开启"IMAP/SMTP服务"
3. 发送短信获取授权码
4. 使用授权码作为`MAIL_PASSWORD`

---

## 🌐 3. 部署应用

### 🥇 推荐：Vercel (免费 + 快速)

#### 方法A：网页部署 (最简单)

1. **连接GitHub**:
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 连接您的GitHub仓库

2. **配置环境变量**:
   - 在Vercel部署页面添加环境变量
   - 粘贴上面准备的环境变量

3. **部署**:
   - 点击 "Deploy"
   - 等待构建完成 (约2-5分钟)

#### 方法B：命令行部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel

# 后续更新只需要
git push origin main  # 自动触发部署
```

### 🔄 替代部署方案

<details>
<summary>Railway / 腾讯云 / 阿里云部署</summary>

**Railway:**
```bash
# 访问 railway.app
# 连接GitHub仓库
# 配置环境变量
# 自动部署
```

**Docker部署:**
```bash
docker build -t roommate-matching .
docker run -d -p 3000:3000 --env-file .env roommate-matching
```

</details>

---

## 🗄️ 4. 数据库初始化

### 自动迁移脚本

```bash
# 运行自动迁移脚本
npm run deploy:prepare
```

### 手动迁移 (如果脚本失败)

```bash
# 1. 生成迁移文件
npm run db:generate

# 2. 执行迁移
POSTGRES_URL=your_production_db_url npm run db:migrate

# 3. 初始化数据 (可选)
npm run db:seed
```

---

## 📧 5. 配置邮件服务

### 测试邮件功能

```bash
# 部署完成后访问
https://your-app.vercel.app/test-email
```

### 常见邮件服务商配置

| 服务商 | 服务器 | 端口 | 说明 |
|--------|--------|------|------|
| QQ邮箱 | smtp.qq.com | 587 | 需要授权码 |
| 163邮箱 | smtp.163.com | 25/465 | 需要授权码 |
| Gmail | smtp.gmail.com | 587 | 需要应用密码 |
| Outlook | smtp.live.com | 587 | 使用账户密码 |

---

## ✅ 6. 验证部署

### 运行健康检查

```bash
# 检查生产环境状态
npm run production:check
```

### 功能测试清单

- [ ] 主页可以正常访问
- [ ] 用户注册流程正常
- [ ] 邮件验证功能正常
- [ ] 数据库读写正常
- [ ] 登录功能正常
- [ ] 个人资料编辑正常
- [ ] 匹配功能正常

---

## 🆘 故障排除

### 常见问题

**1. 数据库连接失败**
```bash
# 检查连接串格式
# 确认网络访问权限
# 验证用户名密码
```

**2. 邮件发送失败**
```bash
# 检查授权码是否正确
# 确认服务器端口设置
# 查看邮件服务商限制
```

**3. 构建失败**
```bash
# 检查依赖版本冲突
# 查看构建日志
# 验证环境变量设置
```

**4. 部署失败**
```bash
# 检查代码语法错误
# 验证Next.js配置
# 查看平台部署日志
```

---

## 🎯 域名配置 (可选)

### 绑定自定义域名

#### Vercel:
1. 购买域名 (阿里云、腾讯云、GoDaddy等)
2. 在Vercel项目设置中添加域名
3. 配置DNS记录:
   ```
   类型: CNAME
   名称: @
   值: cname.vercel-dns.com
   ```

#### 免费域名选择:
- `.tk`, `.ml`, `.ga` (Freenom)
- `.js.org` (适合开源项目)

---

## 📊 部署后优化

### 性能监控
- [ ] 启用Vercel Analytics
- [ ] 设置错误监控 (Sentry)
- [ ] 配置性能告警

### SEO优化  
- [ ] 添加sitemap.xml
- [ ] 配置meta标签
- [ ] 启用结构化数据

### 安全加固
- [ ] 配置CSP头
- [ ] 启用HSTS
- [ ] 设置访问日志

---

## 📞 支持与反馈

### 部署成功 ✅
恭喜！您的室友匹配系统现已成功部署！

**下一步:**
1. 分享应用链接给目标用户
2. 收集用户反馈
3. 根据需要调整功能
4. 定期备份数据

### 需要帮助 ❓
- 查看详细文档: [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)
- 邮件配置: [EMAIL_SETUP.md](./docs/EMAIL_SETUP.md)
- GitHub Issues: 提交问题和建议

---

**🎉 预计部署时间: 15-30分钟**  
**💰 预计月费用: $0-5 (基础使用)**  
**👥 支持用户数: 1000+ (免费额度)**

开始探索您的室友匹配系统吧！ 🏠✨