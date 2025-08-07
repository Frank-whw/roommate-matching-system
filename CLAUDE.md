# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RoomieSync (室友匹配系统) is a Next.js-based roommate matching application designed for university students. The system features user authentication, profile management, matching algorithms, and team formation capabilities.

## Common Development Commands

### Development Server
```bash
npm run dev                    # Start Next.js development server on http://localhost:3000
npm run build                  # Build production application
npm run start                  # Start production server
```

### Database Operations
```bash
npm run db:setup              # Initialize database with schema
npm run db:seed               # Seed database with sample data
npm run db:generate           # Generate Drizzle migrations
npm run db:migrate            # Apply database migrations
npm run db:studio             # Open Drizzle Studio for database management
```

### Deployment & Environment
```bash
npm run deploy:prepare        # Prepare for cloud deployment
npm run production:check      # Verify production readiness
npm run check:env             # Validate environment variables
npm run setup:vercel          # Configure Vercel deployment
```

## Tech Stack & Architecture

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Radix UI components with Tailwind CSS
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Validation**: Zod schemas for type safety
- **Email**: Nodemailer for email verification

### Key Architecture Components

#### Authentication Flow
- Email/password registration with email verification
- JWT-based session management via cookies
- Global middleware protection for authenticated routes
- Student ID format validation (102*55014**)
- Education email domain verification (@stu.ecnu.edu.cn)

#### Database Schema Structure
The system uses a comprehensive relational schema:
- **users**: Core user account information
- **userProfiles**: Detailed user preferences (MBTI, lifestyle, sleep habits)
- **teams**: Team creation and management
- **teamMembers**: Team membership tracking
- **teamJoinRequests**: Application system for teams
- **userLikes**: Like/dislike relationship tracking
- **matches**: Successful mutual matches
- **activityLogs**: User activity tracking

#### Matching System
- Individual user matching based on profile compatibility
- Team-based matching with leader/member roles
- Real-time notifications for matches and team requests
- Activity logging for user behavior tracking

## File Structure Patterns

### Route Structure
- `/app/(login)/`: Authentication pages (sign-in, sign-up)
- `/app/api/`: API routes organized by feature
- `/app/dashboard/`: Main user dashboard
- `/app/explore/`: User discovery and browsing
- `/app/matches/`: Match management
- `/app/profile/`: Profile editing
- `/app/teams/`: Team management

### Component Organization
- `/components/ui/`: Reusable UI components (Radix-based)
- `/components/[feature]/`: Feature-specific components
- `/contexts/`: React context providers
- `/hooks/`: Custom React hooks
- `/lib/`: Utility functions and configurations

### API Route Patterns
All API routes follow RESTful conventions with consistent error handling:
- Success: `{ success: true, message: string, data: object }`
- Error: `{ error: string, success: false }`

## Configuration Files

### Environment Variables
Configure in `.env`:
- `POSTGRES_URL`: Database connection string
- SMTP configuration for email verification
- JWT secret for session management

### Key Config Files
- `lib/config.ts`: Site configuration and auth rules
- `drizzle.config.ts`: Database configuration
- `middleware.ts`: Global route protection
- `lib/validation/schemas.ts`: Zod validation schemas

## Development Guidelines

### Database Changes
1. Modify schema in `lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`
4. Update TypeScript types automatically via Drizzle

### Adding New Features
1. Create API route in `/app/api/[feature]/`
2. Add validation schema in `lib/validation/schemas.ts`
3. Create UI components in `/components/[feature]/`
4. Add page routes in `/app/[feature]/`
5. Update activity logging if needed

### Authentication Integration
- Use `lib/auth/session.ts` for session management
- Protect routes with middleware in `middleware.ts`
- Server Actions should validate sessions locally

## Real-time Features
- Polling-based updates via `/api/realtime/check-updates`
- Toast notifications for matches and team activities
- Context providers for real-time state management

## Internationalization
The application is primarily in Chinese with English code comments. UI text should follow existing patterns for consistency.