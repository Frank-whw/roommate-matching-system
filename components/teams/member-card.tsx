'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  MessageCircle,
  Mail,
  UserMinus,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { removeMember } from '@/app/teams/actions';
import { generateEmailFromStudentId } from '@/lib/utils/email';

interface MemberCardProps {
  member: any;
  user: any;
  profile: any;
  currentUserId: number;
  isLeader: boolean;
  teamId: number;
  showContacts?: boolean;
  contactInfo?: any;
}

export function MemberCard({ 
  member, 
  user, 
  profile, 
  currentUserId, 
  isLeader, 
  teamId, 
  showContacts = false, 
  contactInfo 
}: MemberCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const isCurrentUser = user.id === currentUserId;
  const isMemberLeader = member.isLeader;

  const handleRemoveMember = async () => {
    if (!confirm(`确定要移除成员 ${user.name || '用户' + user.id} 吗？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await removeMember({
        teamId,
        memberId: user.id,
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

  return (
    <div className="group relative flex items-start space-x-4 p-5 bg-white/80 dark:bg-gray-900/70 border border-white/40 dark:border-gray-700/60 rounded-xl backdrop-blur-2xl shadow-lg hover:shadow-xl transition-all duration-200">
      {/* 点击区域覆盖整个卡片 */}
      <Link 
        href={`/users/${user.id}`}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`查看 ${user.name || '用户' + user.id} 的详情`}
      />
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white/50 dark:ring-gray-700/50">
          {user.name ? user.name.substring(0, 2) : generateEmailFromStudentId(user.studentId).substring(0, 2).toUpperCase()}
        </div>
        {isMemberLeader && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
            <Crown className="w-3 h-3 text-white" style={{ fill: 'none', stroke: 'currentColor' }} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {user.name || '用户' + user.id}
              </p>
              {isMemberLeader && (
                <Badge variant="outline" className="ml-2 text-xs text-yellow-700 dark:text-yellow-300 border-yellow-400/80 dark:border-yellow-600/80 bg-yellow-100/80 dark:bg-yellow-900/30 backdrop-blur-md">
                  队长
                </Badge>
              )}
              {isCurrentUser && (
                <Badge variant="outline" className="ml-2 text-xs text-blue-700 dark:text-blue-300 border-blue-400/80 dark:border-blue-600/80 bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-md">
                  您
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <span>加入于 {new Date(member.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* 管理按钮区域 */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* 查看详情按钮 */}
            <Button variant="ghost" size="sm" asChild className="relative z-20">
              <Link href={`/users/${user.id}`}>
                <ExternalLink className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />
              </Link>
            </Button>
            
            {/* 队长管理菜单 */}
            {isLeader && !isCurrentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isProcessing} className="relative z-20">
                    <MoreHorizontal className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="relative z-50">
                  <DropdownMenuLabel>成员管理</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400"
                    onClick={handleRemoveMember}
                  >
                    <UserMinus className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                    移除成员
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* 显示联系方式 */}
        {showContacts && !isCurrentUser && contactInfo && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-sm">
              {contactInfo.email && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  <span className="truncate">{contactInfo.email}</span>
                </div>
              )}
              {contactInfo.wechatId && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <MessageCircle className="w-4 h-4 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                  <span>{contactInfo.wechatId}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}