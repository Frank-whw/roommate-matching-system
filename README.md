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
