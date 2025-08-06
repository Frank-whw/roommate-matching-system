# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based roommate matching system (室友匹配系统) built with TypeScript, React, and PostgreSQL. The system allows students to find compatible roommates through profile matching, team formation, and a like-based matching system.

## Development Commands

### Database Operations
- `npm run db:setup` - Initialize database and create .env file
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with test data (creates test@test.com/admin123)
- `npm run db:generate` - Generate Drizzle schema files
- `npm run db:studio` - Open Drizzle Studio for database management

### Development Server
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Deployment & Production
- `npm run deploy:prepare` - Prepare for cloud deployment
- `npm run production:check` - Run production readiness checks
- `npm run test:email` - Test email functionality (visit /test-email page)

## Architecture

### Database Schema (Drizzle ORM + PostgreSQL)
The system uses a comprehensive relational schema with the following key entities:

- **users** - Basic user authentication (studentId, email, passwordHash)
- **userProfiles** - Detailed user information (demographics, preferences, MBTI, lifestyle)
- **teams** - Group formation system with leaders and recruitment
- **teamMembers** - Team membership tracking
- **teamJoinRequests** - Team application workflow
- **userLikes** - User-to-user preference system
- **matches** - Mutual like relationships with match scores
- **activityLogs** - System activity tracking

Key constraints:
- Student ID format: 102*55014** (华师大格式)
- Email domain: @stu.ecnu.edu.cn only
- One user per team limit enforced

### API Structure (Next.js App Router)
All API routes are in `/app/api/`:
- `/auth/*` - Authentication (login, register, verify-email, logout)
- `/profile` - User profile management
- `/matches/*` - Match system and recommendations
- `/teams/*` - Team creation, joining, management
- `/users/*` - User discovery and information
- `/realtime/*` - Live updates and notifications

### Frontend Architecture
- **App Router** - Next.js 15 with TypeScript
- **UI Components** - shadcn/ui with Radix UI primitives
- **Styling** - Tailwind CSS with custom theming system
- **State Management** - React Context for theme and realtime data
- **Authentication** - JWT tokens stored in cookies, middleware protection

### Key Context Providers
- **ThemeProvider** (`contexts/theme-context.tsx`) - Light/dark mode + color themes
- **RealtimeProvider** (`contexts/realtime-context.tsx`) - Live notifications and polling

### Component Organization
- `components/ui/` - Reusable UI components (shadcn/ui)
- `components/auth/` - Authentication forms
- `components/profile/` - Profile management
- `components/matches/` - Matching system UI
- `components/teams/` - Team management interface
- `components/explore/` - User discovery
- `components/realtime/` - Notification system

## Configuration

### Authentication Config (`lib/config.ts`)
- JWT expiration: 1 day
- Email verification: 10 minutes
- Password requirements: 8+ chars, upper/lower/numbers
- Restricted to @stu.ecnu.edu.cn domain

### Theme System
The app includes a comprehensive theming system supporting:
- Light/dark mode toggle
- Multiple color schemes (blue, green, orange, red)
- CSS custom properties for consistent styling
- Theme persistence via localStorage

## Development Guidelines

### Database Changes
1. Modify schema in `lib/db/schema.ts`
2. Run `npm run db:generate` to create migration files
3. Run `npm run db:migrate` to apply changes
4. Update TypeScript types (auto-generated from schema)

### Email System
Email functionality uses Nodemailer with configuration in `lib/email.ts`. Test email setup via `/test-email` page.

### Authentication Flow
- Registration requires student ID + edu email verification
- JWT middleware in `middleware.ts` (currently simplified)
- Session management in `lib/auth/session.ts`

### API Development
- Use Zod schemas for validation (`lib/validation/schemas.ts`)
- Activity logging for user actions (`lib/db/queries.ts`)
- Consistent error handling via `lib/errors/`

### Real-time Features
The system includes polling-based real-time notifications for:
- New matches (mutual likes)
- Team join requests and responses
- Profile updates

## Special Features

### Student ID Validation
The system enforces a specific student ID format (102*55014**) matching 华东师范大学 (ECNU) pattern.

### MBTI Integration
User profiles include MBTI personality types for compatibility matching.

### Team System
Users can create teams (max 4 members) with recruitment workflows, join requests, and leadership roles.

### Matching Algorithm
The system supports both individual matching (via likes) and team-based roommate finding with compatibility scoring.