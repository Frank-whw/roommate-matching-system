import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/db/queries';
import { ExploreHeader } from '@/components/explore/explore-header';
import { UserCardGrid } from '@/components/explore/user-card-grid';
import { FilterSidebar } from '@/components/explore/filter-sidebar';
import { ProfileGuard } from '@/components/profile/profile-guard';
import { 
  Users, 
  Heart,
  Search,
  Filter,
  Loader2
} from 'lucide-react';

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: {
    search?: string;
    gender?: string;
    minAge?: string;
    maxAge?: string;
    sleepTime?: string;
    studyHabit?: string;
    lifestyle?: string;
    cleanliness?: string;
    mbti?: string;
  };
}) {
  const { user, session } = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // 检查用户是否完成了基本资料
  const hasProfile = !!user.user_profiles;
  const isProfileComplete = user.user_profiles?.isProfileComplete || false;

  // 计算活跃筛选条件数量
  const activeFiltersCount = Object.entries(searchParams).reduce((count, [key, value]) => {
    if (!value) return count;
    if (key === 'minAge' && value === '18') return count;
    if (key === 'maxAge' && value === '30') return count;
    if (key === 'gender' && value === 'all') return count;
    return count + 1;
  }, 0);

  return (
    <ProfileGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* 页面头部 */}
          <ExploreHeader 
            hasProfile={hasProfile}
            isProfileComplete={isProfileComplete}
            activeFiltersCount={activeFiltersCount}
          />

          {/* 主要内容区域 */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 左侧过滤器 */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <FilterSidebar />
              </div>
            </div>

            {/* 右侧用户卡片网格 */}
            <div className="lg:col-span-3">
              <Suspense fallback={<UserCardGridSkeleton />}>
                <UserCardGrid 
                  currentUserId={user.users?.id} 
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </ProfileGuard>
  );
}

// 加载骨架屏组件
function UserCardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border animate-pulse">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
          <div className="flex justify-between mt-4 sm:mt-6 space-x-2">
            <div className="w-16 sm:w-20 h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-16 sm:w-20 h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}