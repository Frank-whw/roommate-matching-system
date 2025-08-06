import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/db/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Plus,
  Search,
  Crown,
  MessageSquare,
  Clock,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { TeamsList } from '@/components/teams/teams-list';
import { MyTeam } from '@/components/teams/my-team';
import { JoinRequests } from '@/components/teams/join-requests';
import { ProfileGuard } from '@/components/profile/profile-guard';
import Breadcrumb from '@/components/navigation/breadcrumb';
import { breadcrumbConfigs } from '@/lib/breadcrumb-configs';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const { user, session } = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <ProfileGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbConfigs.teams} className="mb-4" />
        
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-500" />
                室友队伍
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                组建或加入室友队伍，找到最佳室友组合
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/teams/create">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">创建队伍</span>
                  <span className="sm:hidden">创建</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 功能导航卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                我的队伍
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">1</div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                已加入队伍
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <UserPlus className="w-5 h-5 mr-2 text-green-500" />
                待处理申请
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                需要审核
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                发送申请
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">0</div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                等待回复
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Search className="w-5 h-5 mr-2 text-purple-500" />
                可加入队伍
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">5</div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                正在招募
              </p>
            </CardContent>
          </Card>
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
                  您当前加入的队伍信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<MyTeamSkeleton />}>
                  <MyTeam currentUserId={user.users?.id} />
                </Suspense>
              </CardContent>
            </Card>

            {/* 队伍列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-purple-500" />
                  寻找队伍
                </CardTitle>
                <CardDescription>
                  浏览并申请加入其他队伍
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<TeamsListSkeleton />}>
                  <TeamsList currentUserId={user.users?.id} />
                </Suspense>
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

            {/* 队伍规则提示 */}
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  队伍规则
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-700 dark:text-amber-300">
                <ul className="space-y-2">
                  <li>• 每个用户只能加入一个队伍</li>
                  <li>• 队伍最多4人，包括队长</li>
                  <li>• 队长可以审批新成员申请</li>
                  <li>• 队长离开时会自动转交给其他成员</li>
                  <li>• 队伍解散后所有成员都可重新组队</li>
                </ul>
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/teams/create">
                    <Plus className="w-4 h-4 mr-2" />
                    创建新队伍
                  </Link>
                </Button>
                
                <Button asChild className="w-full" variant="outline">
                  <Link href="/explore">
                    <Search className="w-4 h-4 mr-2" />
                    寻找室友
                  </Link>
                </Button>
                
                <Button asChild className="w-full" variant="outline">
                  <Link href="/matches">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    查看匹配
                  </Link>
                </Button>
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

function TeamsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      ))}
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