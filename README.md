# 室友匹配系统

这是一个基于 **Next.js** 构建的室友匹配应用程序，支持用户认证和登录用户的仪表板功能。

## 功能特性

- 默认首页 (`/`)
- 站点配置文件 `lib/config.ts`，记得更新名称和描述
- 基于邮箱/密码的身份认证，JWT 存储在 cookies 中
- 全局中间件保护登录路由
- 本地中间件保护 Server Actions 或验证 Zod 模式
- 用户事件活动日志系统

## 技术栈

- **框架**: [Next.js](https://nextjs.org/)
- **数据库**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **UI 库**: [shadcn/ui](https://ui.shadcn.com/)

## 快速开始

```bash
git clone git@github.com:Frank-whw/roommate-matching-system.git
cd roommate-matching-system
npm install
```

## 本地运行

创建您的 `.env` 文件：

数据库相关配置请联系 Frank-whw

SMTP 相关配置请联系 Frank-whw

最后，运行 Next.js 开发服务器：

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用程序运行效果。


## todo

**feature**
- [x] 不收集学业信息
- [ ] 确定用户显示名称：昵称 vs 真实姓名
- [ ] 用户头像要不要存储？存储在哪
- [ ] 收集用户地域信息（南方/北方）——hyq建议
- [ ] 匹配算法选择：加权算法 vs AI匹配
	- [ ] 匹配算法权重配置
- [ ] 筛选功能完善（目前为占位符）

**UI/UX改进**
- [ ] 移除显示模式切换（高级筛选、推荐排序）
- [ ] 实现黑夜模式和主题色切换
- [x] 移除"跳过"功能（用户量少，无必要）
- [x] "喜欢"改为"邀请"更合适
- [x] 移除无用标签（新用户、活跃用户等）
