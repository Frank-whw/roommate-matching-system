import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/db/queries';

import { MyTeam } from '@/components/teams/my-team';
import { JoinRequests } from '@/components/teams/join-requests';
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
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-500" />
                队伍管理
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                管理您的队伍和邀请
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button asChild size="sm" variant="outline" className="text-xs sm:text-sm">
                <Link href="/teams">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">浏览队伍</span>
                  <span className="sm:hidden">浏览</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* 我的队伍 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  我的队伍
                </CardTitle>
                <CardDescription>
                  您当前加入的队伍信息和队友联系方式
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<MyTeamSkeleton />}>
                  <MyTeam currentUserId={user.users?.id} showContacts={true} />
                </Suspense>
              </CardContent>
            </Card>

            {/* 队伍邀请管理 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
                  队伍邀请
                </CardTitle>
                <CardDescription>
                  管理您发送和接收的队伍邀请
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">待处理邀请</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">0</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">已发送邀请</div>
                  </div>
                </div>

                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无队伍邀请</p>
                  <p className="text-sm mt-2">去探索页面邀请其他用户加入您的队伍</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 入队申请管理 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-green-500" />
                  入队申请
                </CardTitle>
                <CardDescription>
                  管理您队伍的加入申请
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<JoinRequestsSkeleton />}>
                  <JoinRequests currentUserId={user.users?.id} />
                </Suspense>
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">队伍操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/teams/create">
                    <Crown className="w-4 h-4 mr-2" />
                    创建新队伍
                  </Link>
                </Button>
                
                <Button asChild className="w-full" variant="outline">
                  <Link href="/teams">
                    <Search className="w-4 h-4 mr-2" />
                    浏览队伍广场
                  </Link>
                </Button>
                
                <Button asChild className="w-full" variant="outline">
                  <Link href="/explore">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    个人匹配
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* 队伍规则提示 */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                  <Settings className="w-5 h-5 mr-2" />
                  队伍管理提示
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 dark:text-blue-300">
                <ul className="space-y-2">
                  <li>• 只有队友间才能查看联系方式</li>
                  <li>• 队长可以管理队伍和审批申请</li>
                  <li>• 队伍满员后将停止接受申请</li>
                  <li>• 退出队伍前请与队友协商</li>
                  <li>• 队长不能直接退出有成员的队伍</li>
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