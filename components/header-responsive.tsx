'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, LogOut, User as UserIcon, Users, Heart, Settings } from 'lucide-react';
import { NotificationCenter, NotificationBadge } from '@/components/realtime/notification-center';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';
import { useRouter } from 'next/navigation';
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

  if (!user) {
    return (
      <div className="hidden sm:flex items-center space-x-2 lg:space-x-4">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/sign-in">登录</Link>
        </Button>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/sign-up">注册</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer size-8 sm:size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback className="text-xs sm:text-sm">
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
        <DropdownMenuItem className="w-full cursor-pointer sm:hidden" asChild>
          <Link href="/profile">
            <Settings className="mr-2 h-4 w-4" />
            <span>个人资料</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="w-full cursor-pointer hidden sm:flex" asChild>
          <Link href="/profile">
            <Settings className="mr-2 h-4 w-4" />
            <span>个人资料</span>
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

export default function ResponsiveHeader() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="ml-2 text-lg sm:text-xl font-semibold text-foreground truncate">
              {siteConfig.name}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link 
              href="/explore" 
              className={cn(
                "text-sm font-medium transition-colors px-2 py-1 rounded-md hover:bg-accent",
                pathname?.startsWith('/explore') 
                  ? "text-foreground bg-accent border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              匹配广场
            </Link>
            <Link 
              href="/teams" 
              className={cn(
                "text-sm font-medium transition-colors px-2 py-1 rounded-md hover:bg-accent",
                pathname?.startsWith('/teams') 
                  ? "text-foreground bg-accent border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              队伍广场
            </Link>
            <Link 
              href="/matches" 
              className={cn(
                "text-sm font-medium transition-colors px-2 py-1 rounded-md hover:bg-accent",
                pathname?.startsWith('/matches') 
                  ? "text-foreground bg-accent border-b-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              队伍管理
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="block">
              <NotificationCenter />
            </div>
            <div className="block">
              <ThemeControls />
            </div>
            
            <Suspense fallback={<div className="h-8 w-8 sm:h-9 sm:w-9" />}>
              <UserMenu />
            </Suspense>
            

          </div>
        </div>
      </header>


    </>
  );
}