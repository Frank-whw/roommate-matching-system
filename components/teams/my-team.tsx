import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users, userProfiles } from '@/lib/db/schema';
import { getUserContactInfo } from '@/lib/db/queries';
import { generateEmailFromStudentId } from '@/lib/utils/email';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Crown,
  Plus,
  Search,
  ArrowRight,
  MessageCircle,
  Mail,
  Settings,
  UserMinus,
  AlertTriangle,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { MemberCard } from './member-card';
import { TeamManagementActions } from './team-management-actions';

interface MyTeamProps {
  currentUserId?: number;
  showContacts?: boolean; // 是否显示联系方式
}

export async function MyTeam({ currentUserId, showContacts = false }: MyTeamProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <Users className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
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
        <div className="text-center py-16">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-white/60 dark:bg-gray-800/60 rounded-full flex items-center justify-center backdrop-blur-md border border-white/40 dark:border-gray-700/60">
              <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                您还没有加入任何队伍
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                创建自己的队伍成为队长，或者申请加入其他队伍
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button asChild className="bg-blue-600/95 hover:bg-blue-700/95 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-6 py-2 font-medium backdrop-blur-md">
                  <Link href="/teams/create">
                    <Plus className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                    创建队伍
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-white/50 dark:border-gray-700/70 text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md">
                  <Link href="/teams">
                    <Search className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                    浏览队伍
                    <ArrowRight className="w-4 h-4 ml-2" style={{ fill: 'none', stroke: 'currentColor' }} />
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

    // 如果需要显示联系方式，获取每个队友的联系信息
    let contactsInfo: Record<number, any> = {};
    if (showContacts) {
      for (const { user } of allTeamMembers) {
        if (user.id !== currentUserId) {
          const contact = await getUserContactInfo(currentUserId, user.id);
          contactsInfo[user.id] = contact;
        }
      }
    }

    return (
      <div className="space-y-6">
        {/* 队伍基本信息 */}
        <div className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-300/60 dark:border-blue-700/60 rounded-xl p-6 backdrop-blur-2xl shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <Crown className="w-6 h-6 text-yellow-500 mr-3" style={{ fill: 'none', stroke: 'currentColor' }} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teamInfo.team.name}
                </h3>
                {teamInfo.membership.isLeader && (
                  <Badge variant="outline" className="ml-3 text-yellow-700 dark:text-yellow-300 border-yellow-400/80 dark:border-yellow-600/80 bg-yellow-100/80 dark:bg-yellow-900/30 backdrop-blur-md">
                    队长
                  </Badge>
                )}
              </div>
              
              {teamInfo.team.description && (
                <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">
                  {teamInfo.team.description}
                </p>
              )}
              
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                <Users className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
                <span>{teamInfo.team.currentMembers}/{teamInfo.team.maxMembers} 成员</span>
                <span className="mx-3">•</span>
                <span>创建于 {new Date(teamInfo.team.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="ml-6">
              <Badge 
                variant={teamInfo.team.status === 'recruiting' ? 'default' : 'secondary'}
                className={
                  teamInfo.team.status === 'recruiting' 
                    ? 'bg-green-100/80 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300/80 dark:border-green-700/80 backdrop-blur-md'
                    : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 border-gray-300/80 dark:border-gray-700/80 backdrop-blur-md'
                }
              >
                {teamInfo.team.status === 'recruiting' && '招募中'}
                {teamInfo.team.status === 'full' && '已满员'}
                {teamInfo.team.status === 'disbanded' && '已解散'}
              </Badge>
            </div>
          </div>
        </div>

        {/* 队伍成员 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            队伍成员 ({allTeamMembers.length})
            {showContacts && (
              <Badge variant="outline" className="ml-3 text-green-700 dark:text-green-300 border-green-400/80 dark:border-green-600/80 bg-green-100/80 dark:bg-green-900/30 backdrop-blur-md">
                含联系方式
              </Badge>
            )}
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {allTeamMembers.map(({ member, user, profile }) => (
              <MemberCard
                key={member.id}
                member={member}
                user={user}
                profile={profile}
                currentUserId={currentUserId}
                isLeader={teamInfo.membership.isLeader}
                teamId={teamInfo.team.id}
                showContacts={showContacts}
                contactInfo={contactsInfo[user.id]}
              />
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

        {/* 队长管理区域 */}
        {teamInfo.membership.isLeader && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-medium text-gray-900 dark:text-white flex items-center">
                <Settings className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                队长管理
              </h4>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/teams/${teamInfo.team.id}/edit`}>
                    <Edit className="w-4 h-4 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                    编辑
                  </Link>
                </Button>
                <TeamManagementActions 
                  teamId={teamInfo.team.id} 
                  teamName={teamInfo.team.name} 
                  isLeader={teamInfo.membership.isLeader} 
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              点击成员卡片查看详情，使用右侧菜单管理成员
            </p>
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