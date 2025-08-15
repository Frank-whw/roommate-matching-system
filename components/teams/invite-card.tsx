'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { respondToTeamInvite } from '@/app/explore/actions';
import { Check, X, Clock, Users, Eye } from 'lucide-react';

interface InviteCardProps {
  request: any;
  team: any;
  user: any;
  type: 'received' | 'sent';
  // 移除 formatDate 属性
}

export default function InviteCard({ request, team, user, type }: InviteCardProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<null | 'accept' | 'reject'>(null);

  // 将 formatDate 函数移到组件内部
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

  const handleResponse = async (accept: boolean) => {
    const action = accept ? '接受' : '拒绝';
    if (!confirm(`确定要${action}来自「${team.name}」的邀请吗？`)) return;

    try {
      setLoadingAction(accept ? 'accept' : 'reject');
      const result = await respondToTeamInvite({ requestId: request.id, accept });
      if (result.error) {
        alert(result.error);
      } else {
        // 轻量刷新以获取最新列表
        router.refresh();
      }
    } catch (e) {
      console.error('响应邀请失败:', e);
      alert('操作失败，请重试');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=6366f1&color=fff`} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
            {user?.name ? user.name.substring(0, 2) : 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
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
              <Clock className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
              {formatDate(request.createdAt)}
            </div>
          </div>

          {/* 队伍信息或用户信息 */}
          {type === 'received' ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" style={{ fill: 'none', stroke: 'currentColor' }} />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      队伍：{team?.name || '未知队伍'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/teams/${team?.id}`)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  <Eye className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  查看队伍详情
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/users/${user?.id}`)}
                className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
              >
                <Eye className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                查看用户详情
              </Button>
            </div>
          )}

          
          {/* {request.message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">{request.message}</p>
            </div>
          )} */}

          {type === 'received' ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">邀请ID: #{request.id}</div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResponse(false)}
                  disabled={loadingAction !== null}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <X className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  {loadingAction === 'reject' ? '拒绝中...' : '拒绝'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleResponse(true)}
                  disabled={loadingAction !== null}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  {loadingAction === 'accept' ? '接受中...' : '接受'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">等待 {user?.name || '用户'} 回应...</div>
          )}
        </div>
      </div>
    </div>
  );
}

