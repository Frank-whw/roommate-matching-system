import { getUsersForMatching } from '@/lib/db/queries';
import { UserCard } from '@/components/explore/user-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Users,
  RefreshCw,
  Heart,
  Search
} from 'lucide-react';

interface UserCardGridProps {
  currentUserId?: number;
  limit?: number;
}

export async function UserCardGrid({ currentUserId, limit = 12 }: UserCardGridProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <Search className="h-4 w-4" />
        <AlertDescription>
          请先登录以查看匹配的用户
        </AlertDescription>
      </Alert>
    );
  }

  try {
    const users = await getUsersForMatching(currentUserId, limit);

    if (users.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                暂无可匹配的用户
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                可能的原因：<br />
                • 所有用户都已互动过<br />
                • 筛选条件过于严格<br />
                • 暂时没有符合条件的活跃用户
              </p>
              <div className="flex space-x-3 justify-center">
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新页面
                </Button>
                <Button variant="outline" size="sm">
                  调整筛选
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 结果统计 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>找到 {users.length} 位匹配的用户</span>
          </div>
          <Button variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* 用户卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map(({ user, profile }) => (
            <UserCard
              key={user.id}
              user={user}
              profile={profile}
              currentUserId={currentUserId}
            />
          ))}
        </div>

        {/* 加载更多 */}
        {users.length >= limit && (
          <div className="text-center pt-6">
            <Button variant="outline">
              加载更多用户
            </Button>
          </div>
        )}
      </div>
    );

  } catch (error) {
    console.error('获取匹配用户时出错:', error);
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertDescription className="text-red-800 dark:text-red-200">
          加载用户数据时出现错误，请刷新页面重试
        </AlertDescription>
      </Alert>
    );
  }
}