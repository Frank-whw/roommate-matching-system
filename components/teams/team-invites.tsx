import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teamJoinRequests, teams, users } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InviteCard from '@/components/teams/invite-card';
import { UserPlus, Clock, Mail, Users } from 'lucide-react';

interface TeamInvitesProps {
  currentUserId?: number;
}

export async function TeamInvites({ currentUserId }: TeamInvitesProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <UserPlus className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
        <AlertDescription>
          请先登录以查看邀请列表
        </AlertDescription>
      </Alert>
    );
  }

  try {
    // 获取用户收到的邀请
    const receivedInvites = await db
      .select({
        request: teamJoinRequests,
        team: teams,
        inviter: users,
      })
      .from(teamJoinRequests)
      .innerJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .leftJoin(users, eq(teamJoinRequests.invitedBy, users.id))
      .where(
        and(
          eq(teamJoinRequests.userId, currentUserId),
          eq(teamJoinRequests.status, 'pending'),
          eq(teamJoinRequests.requestType, 'invitation')
        )
      )
      .orderBy(teamJoinRequests.createdAt);

    // 获取用户发送的邀请
    const sentInvites = await db
      .select({
        request: teamJoinRequests,
        team: teams,
        invitee: users,
      })
      .from(teamJoinRequests)
      .innerJoin(teams, eq(teamJoinRequests.teamId, teams.id))
      .innerJoin(users, eq(teamJoinRequests.userId, users.id))
      .where(
        and(
          eq(teamJoinRequests.invitedBy, currentUserId),
          eq(teamJoinRequests.status, 'pending'),
          eq(teamJoinRequests.requestType, 'invitation')
        )
      )
      .orderBy(teamJoinRequests.createdAt);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
      
      if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}分钟前`;
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}小时前`;
      } else {
        return `${Math.floor(diffInMinutes / 1440)}天前`;
      }
    };

    if (receivedInvites.length === 0 && sentInvites.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ fill: 'none', stroke: 'currentColor' }} />
          <p>暂无队伍邀请</p>
          <p className="text-sm mt-2">去探索页面邀请其他用户加入您的队伍</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {receivedInvites.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">待处理邀请</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {sentInvites.length}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">已发送邀请</div>
          </div>
        </div>

        {/* 收到的邀请 */}
        {receivedInvites.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-500" style={{ fill: 'none', stroke: 'currentColor' }} />
              收到的邀请 ({receivedInvites.length})
            </h3>
            <div className="space-y-3">
              {receivedInvites.map(({ request, team, inviter }) => (
                <InviteCard
                  key={request.id}
                  request={request}
                  team={team}
                  user={inviter}
                  type="received"
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}

        {/* 发送的邀请 */}
        {sentInvites.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
              发送的邀请 ({sentInvites.length})
            </h3>
            <div className="space-y-3">
              {sentInvites.map(({ request, team, invitee }) => (
                <InviteCard
                  key={request.id}
                  request={request}
                  team={team}
                  user={invitee}
                  type="sent"
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );

  } catch (error) {
    console.error('获取邀请列表时出错:', error);
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertDescription className="text-red-800 dark:text-red-200">
          加载邀请列表时出现错误，请刷新页面重试
        </AlertDescription>
      </Alert>
    );
  }
}
