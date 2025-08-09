import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/db/queries';
import { MatchesList } from '@/components/matches/matches-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileGuard } from '@/components/profile/profile-guard';
import Breadcrumb from '@/components/navigation/breadcrumb';
import { breadcrumbConfigs } from '@/lib/breadcrumb-configs';
import { 
  Heart,
  Users,
  Sparkles,
  Clock
} from 'lucide-react';

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Heart className="w-8 h-8 mr-3 text-red-500" />
                我的匹配
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                与您互相邀请的室友伙伴
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>总匹配</span>
                <Badge variant="secondary">0</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 匹配状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                新匹配
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                最近的成功匹配
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                历史匹配
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                所有时间总计
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 匹配列表 */}
        <Card>
          <CardHeader>
            <CardTitle>匹配列表</CardTitle>
            <CardDescription>
              您的所有匹配记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<MatchesListSkeleton />}>
              <MatchesList currentUserId={user.users?.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      </div>
    </ProfileGuard>
  );
}

// 加载骨架屏
function MatchesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}