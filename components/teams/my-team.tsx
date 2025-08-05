import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users, userProfiles } from '@/lib/db/schema';
import { TeamCard } from './team-card';
import { TeamManagement } from './team-management';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Users,
  Crown,
  Plus,
  Search,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface MyTeamProps {
  currentUserId?: number;
}

export async function MyTeam({ currentUserId }: MyTeamProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          请先登录以查看队伍信息
        </AlertDescription>
      </Alert>
    );
  }

  try {
    // 查询用户当前所在的队伍
    const userTeam = await db
      .select({
        team: teams,
        membership: teamMembers,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, currentUserId))
      .limit(1);

    if (userTeam.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                您还没有加入任何队伍
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                创建自己的队伍成为队长，或者申请加入其他队伍
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button asChild>
                  <Link href="/teams/create">
                    <Plus className="w-4 h-4 mr-2" />
                    创建队伍
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="#teams-list">
                    <Search className="w-4 h-4 mr-2" />
                    寻找队伍
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 获取队伍的所有成员信息
    const teamInfo = userTeam[0];
    const allTeamMembers = await db
      .select({
        member: teamMembers,
        user: users,
        profile: userProfiles,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(teamMembers.teamId, teamInfo.team.id));

    return (
      <div className="space-y-6">
        {/* 队伍基本信息 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {teamInfo.team.name}
                </h3>
                {teamInfo.membership.isLeader && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    队长
                  </span>
                )}
              </div>
              
              {teamInfo.team.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {teamInfo.team.description}
                </p>
              )}
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Users className="w-4 h-4 mr-1" />
                <span>{teamInfo.team.currentMembers}/{teamInfo.team.maxMembers} 成员</span>
                <span className="mx-2">•</span>
                <span>创建于 {new Date(teamInfo.team.createdAt).toLocaleDateString()}</span>
              </div>


            </div>

            <div className="ml-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                teamInfo.team.status === 'recruiting' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : teamInfo.team.status === 'full'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}>
                {teamInfo.team.status === 'recruiting' && '招募中'}
                {teamInfo.team.status === 'full' && '已满员'}
                {teamInfo.team.status === 'disbanded' && '已解散'}
              </div>
            </div>
          </div>
        </div>

        {/* 队伍成员 */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            队伍成员 ({allTeamMembers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTeamMembers.map(({ member, user, profile }) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name ? user.name.substring(0, 2) : user.email.substring(0, 2).toUpperCase()}
                  </div>
                  {member.isLeader && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name || '用户' + user.id}
                    </p>
                    {member.isLeader && (
                      <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">队长</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <span>加入于 {new Date(member.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 队伍要求 */}
        {teamInfo.team.requirements && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              招募要求
            </h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {teamInfo.team.requirements}
              </p>
            </div>
          </div>
        )}

        {/* 队伍管理区域 */}
        {teamInfo.membership.isLeader && (
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <TeamManagement 
              team={teamInfo.team}
              members={allTeamMembers}
              currentUserId={currentUserId!}
              isLeader={true}
            />
          </div>
        )}
      </div>
    );

  } catch (error) {
    console.error('获取队伍信息时出错:', error);
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertDescription className="text-red-800 dark:text-red-200">
          加载队伍信息时出现错误，请刷新页面重试
        </AlertDescription>
      </Alert>
    );
  }
}