import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, teamJoinRequests, users, userProfiles } from '@/lib/db/schema';
import { JoinRequestCard } from './join-request-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  UserPlus,
  AlertCircle,
  Clock
} from 'lucide-react';

interface JoinRequestsProps {
  currentUserId?: number;
}

export async function JoinRequests({ currentUserId }: JoinRequestsProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <UserPlus className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
        <AlertDescription>
          请先登录以查看申请列表
        </AlertDescription>
      </Alert>
    );
  }

  try {
    // 首先检查用户是否是队长
    const userTeam = await db
      .select({
        team: teams,
        membership: teamMembers,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          eq(teamMembers.userId, currentUserId),
          eq(teamMembers.isLeader, true)
        )
      )
      .limit(1);

    if (userTeam.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                您不是队长
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                只有队长才能审核入队申请
              </p>
            </div>
          </div>
        </div>
      );
    }

    const teamInfo = userTeam[0];

    // 查询该队伍的待处理申请
    const pendingRequests = await db
      .select({
        request: teamJoinRequests,
        applicant: users,
        applicantProfile: userProfiles,
      })
      .from(teamJoinRequests)
      .innerJoin(users, eq(teamJoinRequests.userId, users.id))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(
        and(
          eq(teamJoinRequests.teamId, teamInfo.team.id),
          eq(teamJoinRequests.status, 'pending'),
          eq(teamJoinRequests.requestType, 'application')
        )
      )
      .orderBy(teamJoinRequests.createdAt);

    if (pendingRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                暂无待处理申请
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                当有用户申请加入队伍时会显示在这里
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            待处理申请 ({pendingRequests.length})
          </p>
          {teamInfo.team.currentMembers >= teamInfo.team.maxMembers && (
            <div className="bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded text-xs text-amber-700 dark:text-amber-300">
              队伍已满
            </div>
          )}
        </div>

        {/* 队伍已满提醒 */}
        {teamInfo.team.currentMembers >= teamInfo.team.maxMembers && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertCircle className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            队伍已达到4人满员，建议拒绝新的申请
          </AlertDescription>
        </Alert>
        )}

        <div className="space-y-3">
          {pendingRequests.map(({ request, applicant, applicantProfile }) => (
            <JoinRequestCard
              key={request.id}
              request={request}
              applicant={applicant}
              applicantProfile={applicantProfile}
              teamInfo={teamInfo.team}
            />
          ))}
        </div>
      </div>
    );

  } catch (error) {
    console.error('获取入队申请时出错:', error);
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertDescription className="text-red-800 dark:text-red-200">
          加载申请列表时出现错误，请刷新页面重试
        </AlertDescription>
      </Alert>
    );
  }
}