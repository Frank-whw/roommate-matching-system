import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/db/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users,
  Plus,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { TeamsList } from '@/components/teams/teams-list';
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
      <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbConfigs.teams} className="mb-4" />
        
        {/* 页面标题 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-500" />
                队伍广场
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                浏览所有队伍，找到合适的室友组合
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

        {/* 搜索和筛选区域 */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                搜索队伍
              </CardTitle>
              <CardDescription>
                使用搜索和筛选功能找到合适的队伍
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="搜索队伍名称、要求或描述..."
                    className="w-full"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">搜索功能开发中...</p>
                </div>
                <Button variant="outline" disabled>
                  <Filter className="w-4 h-4 mr-2" />
                  筛选
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 队伍列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              所有队伍
            </CardTitle>
            <CardDescription>
              浏览所有同性别队伍，找到合适的加入
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TeamsListSkeleton />}>
              <TeamsList currentUserId={user.users?.id} showAll={true} />
            </Suspense>
          </CardContent>
        </Card>

        {/* 侧边帮助信息 */}
        <div className="mt-6">
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                <AlertCircle className="w-5 h-5 mr-2" />
                加入队伍提示
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 dark:text-blue-300">
              <ul className="space-y-2">
                <li>• 只能加入同性别队伍</li>
                <li>• 每人只能加入一个队伍</li>
                <li>• 队伍最多4人，包括队长</li>
                <li>• 申请后需要等待队长审核</li>
                <li>• 已在队伍中时只能浏览，不能申请</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </ProfileGuard>
  );
}

// 加载骨架屏组件
function TeamsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
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