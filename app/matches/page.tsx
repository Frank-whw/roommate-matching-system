import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/db/queries';

import { MyTeam } from '@/components/teams/my-team';
import { JoinRequests } from '@/components/teams/join-requests';
import { TeamInvites } from '@/components/teams/team-invites';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileGuard } from '@/components/profile/profile-guard';
import Breadcrumb from '@/components/navigation/breadcrumb';
import { breadcrumbConfigs } from '@/lib/breadcrumb-configs';
import { 
  Users,
  Crown,
  UserPlus,
  MessageSquare,
  Settings,
  Search
} from 'lucide-react';
import Link from 'next/link';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const { user, session } = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <ProfileGuard>
      <div className="min-h-screen bg-transparent">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbConfigs.matches} className="mb-4" />
        
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                队伍管理
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                管理您的队伍和邀请
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button asChild size="sm" variant="outline" className="text-xs sm:text-sm">
                <Link href="/teams">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  <span className="hidden sm:inline">浏览队伍</span>
                  <span className="sm:hidden">浏览</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* 主要内容区域 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 我的队伍 */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                  我的队伍
                </CardTitle>
                <CardDescription className="text-sm">
                  您当前加入的队伍信息和队友联系方式
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Suspense fallback={<MyTeamSkeleton />}>
                  <MyTeam currentUserId={user.users?.id} showContacts={true} />
                </Suspense>
              </CardContent>
            </Card>

            {/* 队伍邀请和申请管理 - 合并为一行 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 队伍邀请管理 */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <UserPlus className="w-5 h-5 mr-2 text-blue-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                    队伍邀请
                  </CardTitle>
                  <CardDescription className="text-sm">
                    管理您发送和接收的队伍邀请
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Suspense fallback={<TeamInvitesSkeleton />}>
                    <TeamInvites currentUserId={user.users?.id} />
                  </Suspense>
                </CardContent>
              </Card>

              {/* 入队申请管理 */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <UserPlus className="w-5 h-5 mr-2 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                    入队申请
                  </CardTitle>
                  <CardDescription className="text-sm">
                    管理您队伍的加入申请
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Suspense fallback={<JoinRequestsSkeleton />}>
                    <JoinRequests currentUserId={user.users?.id} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 侧边栏 - 更紧凑 */}
          <div className="space-y-4">
            {/* 快捷操作 */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <Button asChild className="w-full h-9" variant="outline" size="sm">
                  <Link href="/teams/create">
                    <Crown className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                    创建队伍
                  </Link>
                </Button>
                
                <Button asChild className="w-full h-9" variant="outline" size="sm">
                  <Link href="/teams">
                    <Search className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                    浏览队伍
                  </Link>
                </Button>
                
                <Button asChild className="w-full h-9" variant="outline" size="sm">
                  <Link href="/explore">
                    <MessageSquare className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                    个人匹配
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* 队伍规则提示 - 更紧凑 */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-blue-800 dark:text-blue-200 text-sm">
                  <Settings className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  管理提示
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-blue-700 dark:text-blue-300">
                <ul className="space-y-1">
                  <li>• 队友间可查看联系方式</li>
                  <li>• 队长可管理队伍和审批</li>
                  <li>• 满员后停止接受申请</li>
                  <li>• 退出前请与队友协商</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </ProfileGuard>
  );
}

// 加载骨架屏组件
function MyTeamSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}



function JoinRequestsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="p-3 border rounded-lg animate-pulse">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamInvitesSkeleton() {
  return (
    <div className="space-y-6">
      {/* 统计信息骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
      
      {/* 邀请列表骨架 */}
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}