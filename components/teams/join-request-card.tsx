'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { reviewJoinRequest } from '@/app/teams/actions';
import { 
  Check,
  X,
  Clock,
  User,
  GraduationCap,
  FileText
} from 'lucide-react';

interface JoinRequestCardProps {
  request: any;
  applicant: any;
  applicantProfile: any;
  teamInfo: any;
}

export function JoinRequestCard({ request, applicant, applicantProfile, teamInfo }: JoinRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReview = async (approved: boolean) => {
    const action = approved ? '批准' : '拒绝';
    if (!confirm(`确定要${action}该用户的申请吗？`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await reviewJoinRequest({
        requestId: request.id,
        approved,
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        window.location.reload();
      }
    } catch (error) {
      console.error('审核申请失败:', error);
      alert('审核失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

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

  const isTeamFull = teamInfo.currentMembers >= teamInfo.maxMembers;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        {/* 申请者头像 */}
        <Avatar className="w-12 h-12">
          <AvatarImage 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.name || applicant.email)}&background=6366f1&color=fff`} 
          />
          <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
            {applicant.name ? applicant.name.substring(0, 2) : applicant.email.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* 申请者信息 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {applicant.name || '用户' + applicant.id}
              </h4>
              <Badge variant="outline" className="ml-2 text-xs">
                <User className="w-3 h-3 mr-1" />
                新申请
              </Badge>
            </div>
            
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(request.createdAt)}
            </div>
          </div>

          {/* 申请者详情 */}
          {applicantProfile && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              <div className="flex items-center">
                <GraduationCap className="w-3 h-3 mr-1" />
                <span>
                  {applicantProfile.major && applicantProfile.grade 
                    ? `${applicantProfile.major} • ${applicantProfile.grade}`
                    : '专业信息待完善'
                  }
                </span>
                {applicantProfile.dormArea && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{applicantProfile.dormArea}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 申请留言 */}
          {request.message && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
              <div className="flex items-start">
                <FileText className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {request.message}
                </p>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              申请ID: #{request.id}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReview(false)}
                disabled={isProcessing}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <X className="w-3 h-3 mr-1" />
                拒绝
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleReview(true)}
                disabled={isProcessing || isTeamFull}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-3 h-3 mr-1" />
                {isProcessing ? '处理中...' : isTeamFull ? '队伍已满' : '批准'}
              </Button>
            </div>
          </div>

          {/* 队伍已满警告 */}
          {isTeamFull && (
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              ⚠️ 队伍已达到4人满员，批准此申请需要先有成员退出
            </div>
          )}
        </div>
      </div>
    </div>
  );
}