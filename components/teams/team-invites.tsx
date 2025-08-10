import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teamJoinRequests, teams, users } from '@/lib/db/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { respondToTeamInvite } from '@/app/explore/actions';
import { 
  UserPlus,
  Check,
  X,
  Clock,
  Mail,
  Users
} from 'lucide-react';

interface TeamInvitesProps {
  currentUserId?: number;
}

export async function TeamInvites({ currentUserId }: TeamInvitesProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <UserPlus className="h-4 w-4" />
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
          <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
              <Mail className="w-5 h-5 mr-2 text-blue-500" />
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
              <Users className="w-5 h-5 mr-2 text-green-500" />
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

// 邀请卡片组件
function InviteCard({ 
  request, 
  team, 
  user, 
  type, 
  formatDate 
}: { 
  request: any;
  team: any;
  user: any;
  type: 'received' | 'sent';
  formatDate: (date: string) => string;
}) {
  const handleResponse = async (accept: boolean) => {
    const action = accept ? '接受' : '拒绝';
    if (!confirm(`确定要${action}来自「${team.name}」的邀请吗？`)) {
      return;
    }

    try {
      const result = await respondToTeamInvite({
        requestId: request.id,
        accept,
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        window.location.reload();
      }
    } catch (error) {
      console.error('响应邀请失败:', error);
      alert('操作失败，请重试');
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        {/* 用户头像 */}
        <Avatar className="w-10 h-10">
          <AvatarImage 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=6366f1&color=fff`} 
          />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
            {user?.name ? user.name.substring(0, 2) : 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* 邀请信息 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {type === 'received' ? `来自 ${user?.name || '用户'}` : `邀请 ${user?.name || '用户'}`}
              </h4>
              <Badge variant="outline" className="ml-2 text-xs">
                {type === 'received' ? '收到邀请' : '已发送'}
              </Badge>
            </div>
            
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(request.createdAt)}
            </div>
          </div>

          {/* 队伍信息 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {team.name}
              </span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {team.currentMembers}/{team.maxMembers}人
              </Badge>
            </div>
            {team.description && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {team.description}
              </p>
            )}
          </div>

          {/* 邀请消息 */}
          {request.message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {request.message}
              </p>
            </div>
          )}

          {/* 操作按钮 - 只有收到的邀请才显示 */}
          {type === 'received' && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                邀请ID: #{request.id}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResponse(false)}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <X className="w-3 h-3 mr-1" />
                  拒绝
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleResponse(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-3 h-3 mr-1" />
                  接受
                </Button>
              </div>
            </div>
          )}

          {/* 发送的邀请只显示状态 */}
          {type === 'sent' && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              等待 {user?.name || '用户'} 回应...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}