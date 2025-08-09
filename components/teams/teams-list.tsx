import { getAvailableTeams, getAllTeams, getUserTeam } from '@/lib/db/queries';
import { TeamCard } from './team-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Users,
  Plus,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface TeamsListProps {
  currentUserId?: number;
  showAll?: boolean; // 是否显示所有队伍（包括已满的）
}

export async function TeamsList({ currentUserId, showAll = false }: TeamsListProps) {
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
    
    // 根据showAll参数选择查询函数
    const teams = showAll 
      ? await getAllTeams(currentUserId, 20)
      : await getAvailableTeams(currentUserId, 20);

    if (teams.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {showAll ? '暂无队伍' : (userTeam ? '暂无其他可加入的队伍' : '暂无可加入的队伍')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {showAll 
                  ? '当前没有任何同性队伍，不如创建一个新队伍吧！'
                  : (userTeam 
                    ? '您已经在队伍中了，当前没有其他招募中的同性队伍' 
                    : '当前没有正在招募的同性队伍，不如创建一个新队伍吧！'
                  )
                }
              </p>
              {(!userTeam || showAll) && (
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
            找到 {teams.length} 个{showAll ? '' : '可加入的'}同性队伍
          </p>
          {userTeam && !showAll && (
            <div className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
              <p className="text-xs text-amber-800 dark:text-amber-200">
                您已在队伍中，仅供浏览
              </p>
            </div>
          )}
          {showAll && userTeam && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              可浏览所有队伍
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6" id="teams-list">
          {teams.map(({ team, leader, memberCount }: any) => (
            <TeamCard
              key={team.id}
              team={team}
              leader={leader}
              leaderProfile={null} // getAllTeams 没有返回 leaderProfile
              currentUserId={currentUserId}
              canJoin={!userTeam && !showAll} // showAll模式下不能申请，只能浏览
              showAll={showAll}
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