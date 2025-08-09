'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { joinTeam } from '@/app/teams/actions';
import { 
  Crown,
  Users,
  MapPin,
  Calendar,
  FileText,
  UserPlus,
  Eye
} from 'lucide-react';

interface TeamCardProps {
  team: any;
  leader: any;
  leaderProfile: any;
  currentUserId: number;
  canJoin: boolean;
  showAll?: boolean; // 是否在显示所有队伍模式
}

export function TeamCard({ team, leader, leaderProfile, currentUserId, canJoin, showAll = false }: TeamCardProps) {
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinTeam = async () => {
    if (!canJoin) {
      if (showAll) {
        alert('请前往队伍广场申请加入队伍');
      } else {
        alert('您已经在一个队伍中了');
      }
      return;
    }

    const message = prompt('请输入申请留言（可选）:');
    if (message === null) return; // 用户取消了

    setIsJoining(true);
    try {
      const result = await joinTeam({
        teamId: team.id,
        message: message || '',
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        window.location.reload();
      }
    } catch (error) {
      console.error('申请加入队伍失败:', error);
      alert('申请失败，请重试');
    } finally {
      setIsJoining(false);
    }
  };

  // 获取按钮文本和状态
  const getButtonText = () => {
    if (isJoining) return '申请中...';
    if (canJoin) return '申请加入';
    
    // 不能申请的情况
    if (showAll) {
      // 队伍广场模式：显示队伍状态
      if (team.currentMembers >= team.maxMembers) {
        return '队伍已满';
      }
      return '仅供浏览';
    } else {
      // 普通模式：用户已在队伍中
      return '已在队伍中';
    }
  };

  const isTeamFull = team.currentMembers >= team.maxMembers;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return '今天创建';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}天前创建`;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
      <CardContent className="p-6">
        {/* 队伍标题 - 可点击查看详情 */}
        <Link href={`/teams/${team.id}`} className="block">
          <div className="flex items-start justify-between mb-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 -m-2 p-2 rounded-lg transition-colors">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mr-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {team.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={
                    isTeamFull 
                      ? "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      : "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                  }
                >
                  {isTeamFull ? '已满员' : '招募中'}
                </Badge>
              </div>
              
              {team.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {team.description}
                </p>
              )}
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Users className="w-4 h-4 mr-1" />
                <span>{team.currentMembers}/{team.maxMembers} 成员</span>
                <span className="mx-2">•</span>
                <Calendar className="w-4 h-4 mr-1" />
                <span>{formatDate(team.createdAt)}</span>
              </div>

              {team.dormArea && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>期望区域：{team.dormArea}</span>
                </div>
              )}
              
              {/* 查看详情提示 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                  <Eye className="w-3 h-3 mr-1" />
                  点击查看队伍详情
                </div>
              </div>
            </div>

            <div className="ml-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {team.maxMembers - team.currentMembers}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                剩余位置
              </div>
            </div>
          </div>
        </Link>

        {/* 队长信息 - 可点击查看队长资料 */}
        <Link href={`/users/${leader.id}`} className="block">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group/leader">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name || leader.email)}&background=3b82f6&color=fff`} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm">
                  {leader.name ? leader.name.substring(0, 2) : leader.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-2 h-2 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover/leader:text-blue-600 dark:group-hover/leader:text-blue-400 transition-colors">
                  {leader.name || '队长' + leader.id}
                </p>
                <Crown className="w-3 h-3 text-yellow-500 ml-1" />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {leaderProfile?.major && leaderProfile?.grade ? (
                  <span>{leaderProfile.major} • {leaderProfile.grade}</span>
                ) : (
                  <span>队长</span>
                )}
              </div>
            </div>
            
            {/* 查看队长资料提示 */}
            <div className="opacity-0 group-hover/leader:opacity-100 transition-opacity">
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <Eye className="w-3 h-3" />
              </div>
            </div>
          </div>
        </Link>

        {/* 招募要求 */}
        {team.requirements && (
          <div className="mb-4">
            <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white mb-2">
              <FileText className="w-4 h-4 mr-1" />
              招募要求
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="line-clamp-3">{team.requirements}</p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>队伍ID: #{team.id}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              onClick={handleJoinTeam}
              disabled={isJoining || !canJoin}
              className={
                canJoin 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }
            >
              <UserPlus className="w-4 h-4 mr-1" />
              {getButtonText()}
            </Button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">队伍成员</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {team.currentMembers}/{team.maxMembers}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(team.currentMembers / team.maxMembers) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}