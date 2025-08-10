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
        <div className="text-center py-16">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-white/60 dark:bg-gray-800/60 rounded-full flex items-center justify-center backdrop-blur-md border border-white/40 dark:border-gray-700/60">
              <Search className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {showAll ? '暂无队伍' : (userTeam ? '暂无其他可加入的队伍' : '暂无可加入的队伍')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {showAll 
                  ? '当前没有任何同性队伍，不如创建一个新队伍吧！'
                  : (userTeam 
                    ? '您已经在队伍中了，当前没有其他招募中的同性队伍' 
                    : '当前没有正在招募的同性队伍，不如创建一个新队伍吧！'
                  )
                }
              </p>
              {(!userTeam || showAll) && (
                <Button asChild className="bg-blue-600/95 hover:bg-blue-700/95 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6 py-2 font-medium backdrop-blur-md">
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
        {/* 统计信息栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
              找到 <span className="text-blue-600 dark:text-blue-400 font-semibold">{teams.length}</span> 个{showAll ? '' : '可加入的'}同性队伍
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {userTeam && !showAll && (
              <div className="bg-amber-100/80 dark:bg-amber-900/50 px-3 py-1.5 rounded-full border border-amber-300/80 dark:border-amber-700/80 backdrop-blur-md">
                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                  您已在队伍中，仅供浏览
                </p>
              </div>
            )}
            {showAll && userTeam && (
              <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-300/80 dark:border-green-700/80 bg-green-100/80 dark:bg-green-900/50 backdrop-blur-md">
                可浏览所有队伍
              </Badge>
            )}
          </div>
        </div>

        {/* 响应式网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="teams-list">
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