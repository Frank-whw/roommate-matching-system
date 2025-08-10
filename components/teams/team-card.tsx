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
    <Card className="group relative overflow-hidden border border-gray-200/80 dark:border-gray-700/60 bg-white/90 dark:bg-gray-900/70 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 rounded-xl">
      <CardContent className="p-5">
        {/* 队伍标题区域 */}
        <Link href={`/teams/${team.id}`} className="block">
          <div className="flex items-start justify-between mb-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 -m-3 p-3 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                  {team.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={
                    isTeamFull 
                      ? "bg-gray-100/90 dark:bg-gray-800/80 border-gray-300/80 dark:border-gray-600/80 text-gray-700 dark:text-gray-200 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-md"
                      : "bg-green-100/90 dark:bg-green-900/50 border-green-300/80 dark:border-green-700/80 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-md"
                  }
                >
                  {isTeamFull ? '已满员' : '招募中'}
                </Badge>
              </div>
              
              {team.description && (
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-3 line-clamp-2 leading-relaxed">
                  {team.description}
                </p>
              )}
              
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-2 space-x-3">
                <div className="flex items-center">
                  <Users className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
                  <span>{team.currentMembers}/{team.maxMembers}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
                  <span>{formatDate(team.createdAt)}</span>
                </div>
              </div>

              {team.dormArea && (
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-2">
                  <MapPin className="w-3 h-3 mr-1 text-gray-500 dark:text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
                  <span className="truncate">{team.dormArea}</span>
                </div>
              )}
              
              {/* 查看详情提示 */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <Eye className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  查看详情
                </div>
              </div>
            </div>

            <div className="ml-4 text-center flex-shrink-0">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-0.5">
                {team.maxMembers - team.currentMembers}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                剩余位置
              </div>
            </div>
          </div>
        </Link>

        {/* 队长信息 */}
        <Link href={`/users/${leader.id}`} className="block">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/70 transition-colors duration-200 group/leader backdrop-blur-md border border-gray-200/60 dark:border-gray-700/50">
            <div className="relative">
              <Avatar className="w-10 h-10 ring-2 ring-white/80 dark:ring-gray-700/70 shadow-md">
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name || leader.email)}&background=3b82f6&color=fff`} 
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                  {leader.name ? leader.name.substring(0, 2) : leader.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <Crown className="w-2 h-2 text-white" style={{ fill: 'none', stroke: 'currentColor' }} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-0.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover/leader:text-blue-600 dark:group-hover/leader:text-blue-400 transition-colors duration-200 truncate">
                  {leader.name || '队长' + leader.id}
                </p>
                <Crown className="w-3 h-3 text-yellow-500 ml-1 flex-shrink-0" style={{ fill: 'none', stroke: 'currentColor' }} />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {leaderProfile?.major && leaderProfile?.grade ? (
                  <span className="truncate">{leaderProfile.major} • {leaderProfile.grade}</span>
                ) : (
                  <span>队长</span>
                )}
              </div>
            </div>
            
            {/* 查看队长资料提示 */}
            <div className="opacity-0 group-hover/leader:opacity-100 transition-opacity duration-200">
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <Eye className="w-3 h-3" style={{ fill: 'none', stroke: 'currentColor' }} />
              </div>
            </div>
          </div>
        </Link>

        {/* 招募要求 */}
        {team.requirements && (
          <div className="mb-4">
            <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-white mb-2">
              <FileText className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" style={{ fill: 'none', stroke: 'currentColor' }} />
              招募要求
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-200 bg-gray-50/80 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-md">
              <p className="line-clamp-2 leading-relaxed">{team.requirements}</p>
            </div>
          </div>
        )}

        {/* 操作按钮区域 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/80 dark:border-gray-700/70">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
            <span>#{team.id}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleJoinTeam}
              disabled={isJoining || !canJoin}
              className={
                canJoin 
                  ? "bg-blue-600/95 hover:bg-blue-700/95 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-4 py-1.5 text-sm font-medium backdrop-blur-md"
                  : "bg-gray-200/90 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300 cursor-not-allowed rounded-lg px-4 py-1.5 text-sm font-medium backdrop-blur-md"
              }
            >
              <UserPlus className="w-3 h-3 mr-1.5" style={{ fill: 'none', stroke: 'currentColor' }} />
              {getButtonText()}
            </Button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">成员进度</span>
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {team.currentMembers}/{team.maxMembers}
            </span>
          </div>
          <div className="w-full bg-gray-200/80 dark:bg-gray-700/70 rounded-full h-1.5 overflow-hidden backdrop-blur-md">
            <div 
              className="bg-gradient-to-r from-blue-500/90 to-purple-600/90 h-1.5 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${(team.currentMembers / team.maxMembers) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}