'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Home, LogOut, User as UserIcon, Users, Heart, Settings, Menu, X, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/db/schema';
import useSWR, { mutate } from 'swr';
import ThemeControls from './theme-controls';
import { siteConfig } from '@/lib/config';
import { generateEmailFromStudentId } from '@/lib/utils/email';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user, error, isLoading } = useSWR<User>('/api/user', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    errorRetryCount: 0,
    shouldRetryOnError: false
  });
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    mutate('/api/user');
    router.push('/');
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-9 w-16 bg-muted animate-pulse rounded-full"></div>
        <div className="h-9 w-16 bg-muted animate-pulse rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/sign-in">登录</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/sign-up">注册</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {generateEmailFromStudentId(user.studentId)
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium text-foreground">
          <div className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span className="truncate">{user.name || generateEmailFromStudentId(user.studentId)}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full cursor-pointer" asChild>
          <Link href="/profile">
            <Settings className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="w-full cursor-pointer" asChild>
          <Link href="/matches">
            <Users className="mr-2 h-4 w-4" />
            <span>队伍管理</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="w-full cursor-pointer" asChild>
          <Link href="/teams">
            <Users className="mr-2 h-4 w-4" />
            <span>浏览队伍</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>登出</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 移动端导航菜单
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/explore', label: '匹配广场', icon: Search },
    { href: '/teams', label: '浏览队伍', icon: Users },
    { href: '/matches', label: '队伍管理', icon: Users },
    { href: '/profile', label: '个人资料', icon: Settings },
  ];

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg z-50">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/explore', label: '匹配广场' },
    { href: '/teams', label: '浏览队伍' },
    { href: '/matches', label: '队伍管理' },
  ];

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Home className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-semibold text-foreground">{siteConfig.name}</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center space-x-4">
          <ThemeControls />
          <MobileNav />
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}