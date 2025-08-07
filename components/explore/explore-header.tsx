'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Heart,
  Search,
  AlertCircle,
  Settings,
  TrendingUp,
  Filter
} from 'lucide-react';

interface ExploreHeaderProps {
  hasProfile: boolean;
  isProfileComplete: boolean;
  activeFiltersCount?: number;
  totalResults?: number;
}

export function ExploreHeader({ 
  hasProfile, 
  isProfileComplete, 
  activeFiltersCount = 0,
  totalResults 
}: ExploreHeaderProps) {
  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Search className="w-8 h-8 mr-3 text-pink-500" />
            匹配广场
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            发现志同道合的室友，找到理想的居住伙伴
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {totalResults !== undefined && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>找到用户</span>
              <Badge variant="secondary">{totalResults}</Badge>
            </div>
          )}
          
          {activeFiltersCount > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>筛选条件</span>
              <Badge variant="outline">{activeFiltersCount}</Badge>
            </div>
          )}
          
        </div>
      </div>

      {/* 资料完善提醒 */}
      {!isProfileComplete && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="flex items-center justify-between">
              <span>
                完善个人资料可以获得更精准的匹配推荐和更高的匹配成功率
              </span>
              <Button variant="outline" size="sm" asChild className="ml-4">
                <Link href="/profile">
                  <Settings className="w-3 h-3 mr-1" />
                  完善资料
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 快速操作栏 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            高级筛选
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            推荐排序
          </Button>
        </div>
        
        <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
          <span>显示模式:</span>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <div className="grid grid-cols-3 gap-0.5 w-3 h-3">
                {Array.from({length: 9}).map((_, i) => (
                  <div key={i} className="bg-current rounded-sm"></div>
                ))}
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}