'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Users, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import useSWR from 'swr';
import { User as UserType } from '@/lib/db/schema';
import { fetcher, authSWRConfig } from '@/lib/auth/client';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: '首页',
    icon: Home,
    requireAuth: false,
  },
  {
    href: '/explore',
    label: '匹配',
    icon: Search,
    requireAuth: true,
  },
  {
    href: '/teams',
    label: '队伍',
    icon: Users,
    requireAuth: true,
  },
  {
    href: '/matches',
    label: '管理',
    icon: Users,
    requireAuth: true,
  },
  {
    href: '/profile',
    label: '我的',
    icon: User,
    requireAuth: true,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: user, error, isLoading } = useSWR<UserType>('/api/user', fetcher, authSWRConfig);
  
  // 如果在登录/注册页面，不显示底部导航
  if (pathname?.startsWith('/sign-') || pathname === '/verify-email' || pathname === '/set-password') {
    return null;
  }
  
  // 检查用户是否已登录（如果有错误或正在加载，视为未登录）
  const isAuthenticated = user && !error && !isLoading;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname?.startsWith(item.href));
          
          // 如果需要认证但用户未登录，显示但禁用
          const isDisabled = item.requireAuth && !isAuthenticated;
          
          return (
            <Link
              key={item.href}
              href={isDisabled ? '/sign-in' : item.href}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 text-xs transition-colors relative',
                isActive && !isDisabled
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground',
                isDisabled && 'opacity-50'
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  'h-5 w-5 transition-transform',
                  isActive && !isDisabled && 'scale-110'
                )} style={{ fill: 'none', stroke: 'currentColor' }} />
              </div>
              <span className={cn(
                'transition-colors font-medium',
                isActive && !isDisabled && 'text-primary'
              )}>
                {item.label}
              </span>
              {isActive && !isDisabled && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}