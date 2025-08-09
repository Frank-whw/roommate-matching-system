import { getAvailableTeams, getUserTeam } from '@/lib/db/queries';
import { TeamCard } from './team-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Users,
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface TeamsListProps {
  currentUserId?: number;
}

export async function TeamsList({ currentUserId }: TeamsListProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          请先登录以查看队伍列表
        </AlertDescription>
      </Alert>
    );
  }

  try {
    // 检查用户是否已经在队伍中
    const userTeam = await getUserTeam(currentUserId);
    
    // 使用 getAvailableTeams 函数获取可加入的队伍（已包含性别过滤）
    const availableTeams = await getAvailableTeams(currentUserId, 10);

    if (availableTeams.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {userTeam ? '暂无其他可加入的队伍' : '暂无可加入的队伍'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {userTeam 
                  ? '您已经在队伍中了，当前没有其他招募中的同性队伍' 
                  : '当前没有正在招募的同性队伍，不如创建一个新队伍吧！'
                }
              </p>
              {!userTeam && (
                <Button asChild>
                  <Link href="/teams/create">
                    <Plus className="w-4 h-4 mr-2" />
                    创建队伍
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            找到 {availableTeams.length} 个可加入的同性队伍
          </p>
          {userTeam && (
            <div className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                您已在队伍中，仅供浏览
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6" id="teams-list">
          {availableTeams.map(({ team, leader }: any) => (
            <TeamCard
              key={team.id}
              team={team}
              leader={leader}
              leaderProfile={null} // getAvailableTeams 没有返回 leaderProfile
              currentUserId={currentUserId}
              canJoin={!userTeam} // 只有没有队伍的用户才能申请加入
            />
          ))}
        </div>
      </div>
    );

  } catch (error) {
    console.error('获取队伍列表时出错:', error);
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertDescription className="text-red-800 dark:text-red-200">
          加载队伍列表时出现错误，请刷新页面重试
        </AlertDescription>
      </Alert>
    );
  }
}