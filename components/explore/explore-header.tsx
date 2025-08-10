'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Search,
  AlertCircle,
  Settings,
  Crown,
  UserPlus,
  Shield
} from 'lucide-react';

interface ExploreHeaderProps {
  hasProfile: boolean;
  isProfileComplete: boolean;
  activeFiltersCount?: number;
  totalResults?: number;
  currentUserTeam?: any;
}

export function ExploreHeader({ 
  hasProfile, 
  isProfileComplete, 
  activeFiltersCount = 0,
  totalResults,
  currentUserTeam
}: ExploreHeaderProps) {
  
  // 检查用户队伍状态
  const hasTeam = !!currentUserTeam;
  const isTeamLeader = currentUserTeam?.membership?.isLeader === true;
  const teamName = currentUserTeam?.team?.name;
  const teamMemberCount = currentUserTeam?.team?.currentMembers || 0;
  const teamMaxMembers = currentUserTeam?.team?.maxMembers || 0;
  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Search className="w-8 h-8 mr-3 text-pink-500" style={{ fill: 'none', stroke: 'currentColor' }} />
            匹配广场
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            发现志同道合的室友，找到理想的居住伙伴
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {totalResults !== undefined && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />
              <span>找到用户</span>
              <Badge variant="secondary">{totalResults}</Badge>
            </div>
          )}
          
          {activeFiltersCount > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>筛选条件</span>
              <Badge variant="outline">{activeFiltersCount}</Badge>
            </div>
          )}
          
        </div>
      </div>

      {/* 队伍状态显示 */}
      {hasTeam ? (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Crown className="h-4 w-4 text-blue-600 dark:text-blue-400" style={{ fill: 'none', stroke: 'currentColor' }} />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>
                  {isTeamLeader ? (
                    <>您是队伍「{teamName}」的队长，可以邀请其他用户加入队伍</>
                  ) : (
                    <>您已加入队伍「{teamName}」，只有队长可以邀请新成员</>
                  )}
                </span>
                <Badge variant="secondary">
                  {teamMemberCount}/{teamMaxMembers}人
                </Badge>
              </div>
              <Button variant="outline" size="sm" asChild className="ml-4">
                <Link href="/teams">
                  <Users className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  队伍管理
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <UserPlus className="h-4 w-4 text-yellow-600 dark:text-yellow-400" style={{ fill: 'none', stroke: 'currentColor' }} />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <div className="flex items-center justify-between">
              <span>
                您还没有加入队伍，需要先创建或加入队伍才能邀请其他用户
              </span>
              <Button variant="outline" size="sm" asChild className="ml-4">
                <Link href="/teams">
                  <Shield className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  创建/加入队伍
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 资料完善提醒 */}
      {!isProfileComplete && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" style={{ fill: 'none', stroke: 'currentColor' }} />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="flex items-center justify-between">
              <span>
                完善个人资料可以获得更精准的匹配推荐和更高的匹配成功率
              </span>
              <Button variant="outline" size="sm" asChild className="ml-4">
                <Link href="/profile">
                  <Settings className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  完善资料
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}