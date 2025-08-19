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
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { TeamsList } from '@/components/teams/teams-list';
import Breadcrumb from '@/components/navigation/breadcrumb';
import { breadcrumbConfigs } from '@/lib/breadcrumb-configs';
import { db } from '@/lib/db/drizzle';
import { teams, userProfiles } from '@/lib/db/schema';
import { eq, and, count } from 'drizzle-orm';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const { user, session } = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if user profile is complete
  const userProfile = await db
    .select({ isProfileComplete: userProfiles.isProfileComplete })
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.users.id))
    .limit(1);

  if (!userProfile[0]?.isProfileComplete) {
    redirect('/profile?from=teams');
  }

  // Get team counts by gender
  const [maleTeamCount, femaleTeamCount] = await Promise.all([
    db.select({ count: count() })
      .from(teams)
      .where(
        and(
          eq(teams.gender, 'male'),
          eq(teams.status, 'recruiting')
        )
      ),
    db.select({ count: count() })
      .from(teams)
      .where(
        and(
          eq(teams.gender, 'female'),
          eq(teams.status, 'recruiting')
        )
      )
  ]);

  const teamStats = {
    male: { current: maleTeamCount[0]?.count || 0, limit: 19 },
    female: { current: femaleTeamCount[0]?.count || 0, limit: 14 }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbConfigs.teams} className="mb-6" />
        
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 mr-3 text-blue-600" style={{ fill: 'none', stroke: 'currentColor' }} />
                浏览队伍
              </h1>
              <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                浏览所有队伍，找到合适的室友组合
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 rounded-lg px-6 py-2 font-medium">
                <Link href="/teams/create">
                  <Plus className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  创建队伍
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="mb-8">
          <Card className="border border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 backdrop-blur-2xl shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg font-semibold">
                <Search className="w-5 h-5 mr-2 text-blue-600" style={{ fill: 'none', stroke: 'currentColor' }} />
                搜索队伍
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-200">
                使用搜索和筛选功能找到合适的队伍
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="搜索队伍名称、要求或描述..."
                    className="w-full border-gray-200/80 dark:border-gray-700/70 focus:border-blue-500 focus:ring-blue-500 bg-white/90 dark:bg-gray-800/70 backdrop-blur-md"
                    disabled
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">搜索功能开发中...</p>
                </div>
                <Button variant="outline" disabled className="border-gray-200/80 dark:border-gray-700/70 text-gray-600 dark:text-gray-300 bg-white/90 dark:bg-gray-800/70 backdrop-blur-md">
                  <Filter className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  筛选
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 队伍列表 */}
        <Card className="border border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 backdrop-blur-2xl shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" style={{ fill: 'none', stroke: 'currentColor' }} />
                所有队伍
              </div>
              {/* 队伍数量统计 */}
              <div className="flex items-center space-x-4 text-sm font-normal">
                <span className="text-blue-600 dark:text-blue-400">
                  男生队伍: {teamStats.male.current}/{teamStats.male.limit}
                </span>
                <span className="text-pink-600 dark:text-pink-400">
                  女生队伍: {teamStats.female.current}/{teamStats.female.limit}
                </span>
              </div>
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-200">
              浏览可加入的同性别队伍，找到合适的加入
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TeamsListSkeleton />}>
              <TeamsList currentUserId={user.users?.id} showAll={false} />
            </Suspense>
          </CardContent>
        </Card>

        {/* 侧边帮助信息 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 队伍数量统计 */}
          <Card className="border-purple-300/80 bg-purple-100/90 dark:border-purple-700/60 dark:bg-purple-900/50 backdrop-blur-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-purple-900 dark:text-purple-100 text-lg font-semibold">
                <Info className="w-5 h-5 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                队伍数量统计
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50/80 dark:bg-blue-900/30 rounded-lg">
                <span className="text-blue-800 dark:text-blue-200">男生队伍</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {teamStats.male.current}/{teamStats.male.limit}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300">
                    剩余 {teamStats.male.limit - teamStats.male.current} 个名额
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-pink-50/80 dark:bg-pink-900/30 rounded-lg">
                <span className="text-pink-800 dark:text-pink-200">女生队伍</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-pink-900 dark:text-pink-100">
                    {teamStats.female.current}/{teamStats.female.limit}
                  </div>
                  <div className="text-xs text-pink-600 dark:text-pink-300">
                    剩余 {teamStats.female.limit - teamStats.female.current} 个名额
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 加入队伍提示 */}
          <Card className="border-blue-300/80 bg-blue-100/90 dark:border-blue-700/60 dark:bg-blue-900/50 backdrop-blur-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-blue-900 dark:text-blue-100 text-lg font-semibold">
                <AlertCircle className="w-5 h-5 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                加入队伍提示
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 dark:text-blue-200">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
                  只能加入同性别队伍
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
                  每人只能加入一个队伍
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
                  队伍最多4人，包括队长
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
                  申请后需要等待队长审核
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
                  已在队伍中时只能浏览，不能申请
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 加载骨架屏组件
function TeamsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-5 border border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 backdrop-blur-2xl shadow-xl rounded-xl animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-6 bg-gray-300/80 dark:bg-gray-600/70 rounded w-1/2 backdrop-blur-md"></div>
            <div className="h-8 bg-gray-300/80 dark:bg-gray-600/70 rounded w-16 backdrop-blur-md"></div>
          </div>
          <div className="h-4 bg-gray-300/80 dark:bg-gray-600/70 rounded mb-3 backdrop-blur-md"></div>
          <div className="h-4 bg-gray-300/80 dark:bg-gray-600/70 rounded w-2/3 mb-4 backdrop-blur-md"></div>
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-lg backdrop-blur-md border border-gray-200/60 dark:border-gray-700/50">
            <div className="w-10 h-10 bg-gray-300/80 dark:bg-gray-600/70 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300/80 dark:bg-gray-600/70 rounded w-1/2 mb-1 backdrop-blur-md"></div>
              <div className="h-3 bg-gray-300/80 dark:bg-gray-600/70 rounded w-1/3 backdrop-blur-md"></div>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200/80 dark:border-gray-700/70">
            <div className="h-3 bg-gray-300/80 dark:bg-gray-600/70 rounded w-12 backdrop-blur-md"></div>
            <div className="h-8 bg-gray-300/80 dark:bg-gray-600/70 rounded w-20 backdrop-blur-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
}