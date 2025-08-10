'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/lib/breadcrumb-configs';

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// 路径映射配置
const pathMappings: Record<string, string> = {
  '/': '首页',
  '/explore': '匹配广场',
  '/teams': '队伍广场',
  '/teams/create': '创建队伍',
  '/matches': '队伍管理',
  '/profile': '个人资料',
  '/sign-in': '登录',
  '/sign-up': '注册',
  '/verify-email': '邮箱验证',
  '/set-password': '设置密码',
};

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // 如果提供了自定义items，使用它们
  const breadcrumbItems = items || generateBreadcrumbItems(pathname || '');
  
  // 如果只有一个项目且是首页，不显示面包屑
  if (breadcrumbItems.length <= 1 && breadcrumbItems[0]?.href === '/') {
    return null;
  }

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            {index === 0 && item.href === '/' && (
              <Home className="h-4 w-4 text-muted-foreground mr-1" />
            )}
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  
  // 始终添加首页
  items.push({ label: '首页', href: '/' });
  
  // 如果不是首页，添加其他路径段
  if (segments.length > 0) {
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = pathMappings[currentPath] || formatSegment(segment);
      
      items.push({
        label,
        href: index < segments.length - 1 ? currentPath : undefined
      });
    });
  }
  
  return items;
}

function formatSegment(segment: string): string {
  // 处理动态路由参数
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return '详情';
  }
  
  // 将连字符和下划线替换为空格，并转换为标题大小写
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// 导出预定义的面包屑配置