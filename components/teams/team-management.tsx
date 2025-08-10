'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  removeMember, 
  disbandTeam, 
  updateTeam 
} from '@/app/teams/actions';
import { 
  Settings,
  Crown,
  UserMinus,
  AlertTriangle,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamManagementProps {
  team: any;
  members: any[];
  currentUserId: number;
  isLeader: boolean;
}

export function TeamManagement({ team, members, currentUserId, isLeader }: TeamManagementProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isLeader) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            只有队长才能管理队伍
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!confirm(`确定要移除成员 ${memberName} 吗？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await removeMember({
        teamId: team.id,
        memberId,
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        window.location.reload();
      }
    } catch (error) {
      console.error('移除成员失败:', error);
      alert('移除成员失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisbandTeam = async () => {
    const teamName = team.name;
    if (!confirm(`确定要解散队伍 "${teamName}" 吗？\n\n此操作将：\n• 移除所有队伍成员\n• 取消所有待处理申请\n• 永久删除队伍\n\n此操作无法撤销！`)) {
      return;
    }

    // Double confirmation for destructive action
    const confirmation = prompt('请输入队伍名称以确认解散：');
    if (confirmation !== teamName) {
      alert('队伍名称不匹配，操作已取消');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await disbandTeam({
        teamId: team.id,
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        window.location.href = '/teams';
      }
    } catch (error) {
      console.error('解散队伍失败:', error);
      alert('解散队伍失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const otherMembers = members.filter(member => member.user.id !== currentUserId);

  return (
    <div className="space-y-6">
      {/* 队伍管理概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
            队伍管理
          </CardTitle>
          <CardDescription>
            作为队长，您可以管理队伍成员和设置
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 队伍状态 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {team.currentMembers}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                当前成员
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {team.maxMembers - team.currentMembers}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                剩余位置
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {team.status === 'recruiting' ? '招募中' : team.status === 'full' ? '已满员' : '已解散'}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                队伍状态
              </div>
            </div>
          </div>

          {/* 快捷操作 */}
          <div className="flex items-center space-x-3 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
              编辑队伍
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDisbandTeam}
              disabled={isProcessing}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
              解散队伍
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 成员管理 */}
      <Card>
        <CardHeader>
          <CardTitle>成员管理 ({members.length})</CardTitle>
          <CardDescription>
            管理队伍成员
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map(({ member, user, profile }) => {
              const isCurrentUser = user.id === currentUserId;
              const isMemberLeader = member.isLeader;
              
              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=6366f1&color=fff`} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                          {user.name ? user.name.substring(0, 2) : user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isMemberLeader && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" style={{ fill: 'none', stroke: 'currentColor' }} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {user.name || '用户' + user.id}
                        </h4>
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            您
                          </Badge>
                        )}
                        {isMemberLeader && (
                          <Badge className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                            队长
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {profile?.major && profile?.grade ? (
                          <span>{profile.major} • {profile.grade}</span>
                        ) : (
                          <span>加入于 {new Date(member.joinedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 成员操作菜单 */}
                  {!isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isProcessing}>
                          <MoreHorizontal className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>成员操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(user.id, user.name || user.email)}
                          className="text-red-600"
                        >
                          <UserMinus className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                          移除成员
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* 当前用户（队长）的特殊标识 */}
                  {isCurrentUser && (
                    <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                      <Crown className="w-4 h-4 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                      队长权限
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 管理提示 */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 mt-0.5" style={{ fill: 'none', stroke: 'currentColor' }} />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-medium mb-1">队长权限说明</p>
                <ul className="space-y-1 text-xs">
                  <li>• 移除成员：将成员从队伍中删除</li>
                  <li>• 解散队伍：永久删除整个队伍（不可撤销）</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}