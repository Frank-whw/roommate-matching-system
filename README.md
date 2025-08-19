# RoomieSync - 智能室友匹配平台

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/Frank-whw/roommate-matching-system?style=social)](https://github.com/Frank-whw/roommate-matching-system)
[![GitHub forks](https://img.shields.io/github/forks/Frank-whw/roommate-matching-system?style=social)](https://github.com/Frank-whw/roommate-matching-system)
[![GitHub issues](https://img.shields.io/github/issues/Frank-whw/roommate-matching-system)](https://github.com/Frank-whw/roommate-matching-system/issues)
[![GitHub license](https://img.shields.io/github/license/Frank-whw/roommate-matching-system)](https://github.com/Frank-whw/roommate-matching-system/blob/main/LICENSE)

**一个现代化的大学室友智能匹配系统**

</div>

## 🎯 项目概述

RoomieSync 是一个基于 Next.js 14 构建的全栈室友匹配平台，专为解决大学新生室友分配问题而设计。系统通过多维度用户画像和智能匹配算法，帮助学生找到最合适的室友，提升住宿体验。

### 🏗️ 系统架构

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes + Drizzle ORM
- **数据库**: PostgreSQL
- **认证**: 自定义 JWT 认证系统
- **通知**: SMTP 邮件服务
- **部署**: Vercel + 云数据库

### 🚀 核心功能

- **多维度匹配算法**: 基于生活习惯、作息时间、兴趣爱好等因素的加权匹配
- **隐私保护机制**: 性别隔离、分级信息展示、敏感信息保护
- **实时邀请系统**: 双向邀请、状态管理、邮件通知
- **响应式设计**: 支持桌面端和移动端，深色模式适配
- **队伍管理**: 创建、加入、退出队伍，成员权限管理

## 🛠️ 技术栈

| 分类 | 技术选型 | 说明 |
|------|----------|------|
| **前端框架** | Next.js 14 | App Router, SSR/SSG, API Routes |
| **开发语言** | TypeScript | 类型安全, 开发效率 |
| **样式方案** | Tailwind CSS | 原子化CSS, 响应式设计 |
| **UI组件库** | shadcn/ui | 现代化组件, 可定制主题 |
| **数据库** | PostgreSQL | 关系型数据库, 事务支持 |
| **ORM** | Drizzle | 轻量级, TypeScript原生 |
| **认证系统** | JWT + bcrypt | 安全哈希, 无状态认证 |
| **邮件服务** | Nodemailer | SMTP协议, 模板支持 |
| **部署平台** | Vercel | 边缘计算, 自动部署 |

## 平台展示


![2369273f8d5a9e9634ebc11d59a1ce81.png](https://raw.githubusercontent.com/Frank-whw/img/main/blog/202508182320900.png)
![c1586bcf6d783702f7586613203daa6e.png](https://raw.githubusercontent.com/Frank-whw/img/main/blog/202508182321732.png)
![image.png](https://raw.githubusercontent.com/Frank-whw/img/main/blog/202508182321366.png)
![ccae40d4cd8c4d84ce3869a33b76c7c9.png](https://raw.githubusercontent.com/Frank-whw/img/main/blog/202508182321569.png)
![40bb9abbf257374364218e5564307149.png](https://raw.githubusercontent.com/Frank-whw/img/main/blog/202508182321070.png)


## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/Frank-whw/roommate-matching-system.git
cd roommate-matching-system

# 安装依赖
npm install

# 配置环境变量 
cp .env.example .env

# 初始化数据库
npm run db:push

# 启动开发服务器
npm run dev
```

## 📊 系统特性

### 数据安全
- **密码加密**: bcrypt哈希算法，盐值随机生成
- **权限控制**: 基于角色的访问控制(RBAC)
- **数据隔离**: 性别分离，敏感信息分级展示
- **API安全**: 请求限流，参数验证，SQL注入防护

## 🔧 项目结构

```
roommate-matching-system/
├── app/                    # Next.js App Router
│   ├── (login)/           # 认证页面组
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关API
│   │   ├── teams/         # 队伍管理API
│   │   └── users/         # 用户管理API
│   ├── explore/           # 用户探索页面
│   ├── matches/           # 匹配结果页面
│   ├── teams/             # 队伍管理页面
│   └── profile/           # 个人资料页面
├── components/            # React 组件库
│   ├── auth/              # 认证相关组件
│   ├── teams/             # 队伍功能组件
│   ├── ui/                # 基础UI组件
│   └── explore/           # 探索功能组件
├── lib/                   # 核心工具库
│   ├── db/                # 数据库层
│   │   ├── schema.ts      # 数据库模式定义
│   │   ├── queries.ts     # 查询函数
│   │   └── migrations/    # 数据库迁移
│   ├── auth/              # 认证逻辑
│   ├── validation/        # 数据验证
│   └── utils/             # 工具函数
└── matching.ts            # 匹配算法实现
```

## 🚀 部署方案

### 生产环境
- **前端**: Vercel 边缘部署
- **数据库**: Neon PostgreSQL
- **邮件**: 第三方SMTP服务
- **监控**: Vercel Analytics + 自定义日志

### 开发脚本
```bash
npm run dev          # 开发服务器
npm run build        # 生产构建
npm run db:push      # 同步数据库架构
npm run db:studio    # 数据库管理界面
```

## 🤝 贡献指南

欢迎其他院校和开发者参与项目改进：

1. **Fork** 项目并创建功能分支
2. **适配** 你的学校需求（用户验证、匹配规则等）
3. **提交** Pull Request 分享改进
4. **讨论** 技术方案和最佳实践

### 技术交流
- **GitHub Issues**: 技术问题和功能建议
- **邮箱**: [10245501488@stu.ecnu.edu.cn](mailto:10245501488@stu.ecnu.edu.cn)
- **文档**: 详细使用指南请参考 [使用指南.md](./食用指南.md)

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议，支持商业和非商业使用。

---

<div align="center">

**🎓 为更好的大学住宿体验而构建**

[![Star History Chart](https://api.star-history.com/svg?repos=Frank-whw/roommate-matching-system&type=Date)](https://star-history.com/#Frank-whw/roommate-matching-system&Date)

</div>

