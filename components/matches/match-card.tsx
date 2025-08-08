'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { unmatchUser } from '@/app/explore/actions';
import { 
  X,
  Calendar,
  Clock,
  GraduationCap,
  MapPin,
  Heart,
  Coffee,
  Sun,
  Moon
} from 'lucide-react';

interface MatchCardProps {
  match: any;
  matchedUser: any;
  matchedUserProfile: any;
  currentUserId: number;
}

const studyHabitLabels: { [key: string]: { label: string; icon: any } } = {
  'early_bird': { label: '早起学习', icon: Sun },
  'night_owl': { label: '夜猫子', icon: Moon },
  'flexible': { label: '灵活安排', icon: Coffee }
};

export function MatchCard({ match, matchedUser, matchedUserProfile, currentUserId }: MatchCardProps) {
  const [isUnmatching, setIsUnmatching] = useState(false);

  const handleUnmatch = async () => {
    if (!confirm('确定要取消与该用户的匹配吗？此操作不可撤销。')) {
      return;
    }

    setIsUnmatching(true);
    try {
      const result = await unmatchUser({ matchId: match.id });
      
      if (result.error) {
        alert(result.error);
      } else {
        alert('已取消匹配');
        window.location.reload();
      }
    } catch (error) {
      console.error('取消匹配失败:', error);
      alert('取消匹配失败，请重试');
    } finally {
      setIsUnmatching(false);
    }
  };

  const handleViewMatch = () => {
    // 显示匹配详情
    alert('匹配详情功能');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '刚刚匹配';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}天前`;
    }
  };

  const StudyHabitIcon = matchedUserProfile?.studyHabit 
    ? studyHabitLabels[matchedUserProfile.studyHabit]?.icon || Coffee 
    : Coffee;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start space-x-3 sm:space-x-4">
          {/* 用户头像 */}
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-pink-100 dark:ring-pink-900">
              <AvatarImage 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(matchedUser.name || matchedUser.email)}&background=f97316&color=fff`} 
              />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                {matchedUser.name ? matchedUser.name.substring(0, 2) : matchedUser.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* 匹配标识 */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
          </div>

          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate pr-2">
                {matchedUser.name || '用户' + matchedUser.id}
              </h3>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{formatDate(match.createdAt)}</span>
                <span className="sm:hidden">{formatDate(match.createdAt).replace('小时前', 'h').replace('天前', 'd').replace('刚刚匹配', '刚刚')}</span>
              </div>
            </div>
            
            {/* 基本信息 */}
            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{matchedUserProfile?.major || '未知专业'}</span>
                <span className="mx-1 sm:mx-2 flex-shrink-0">•</span>
                <span className="truncate">{matchedUserProfile?.grade || '未知年级'}</span>
              </div>
              
              {matchedUserProfile?.dormArea && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{matchedUserProfile.dormArea}</span>
                </div>
              )}
              
              {(matchedUserProfile?.sleepTime || matchedUserProfile?.wakeTime) && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">作息: </span>
                    {matchedUserProfile.sleepTime || '??:??'} - {matchedUserProfile.wakeTime || '??:??'}
                  </span>
                </div>
              )}
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {matchedUserProfile?.mbti && (
                <Badge variant="outline" className="text-xs">
                  {matchedUserProfile.mbti}
                </Badge>
              )}
              
              {matchedUserProfile?.studyHabit && (
                <Badge variant="outline" className="text-xs">
                  <StudyHabitIcon className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">{studyHabitLabels[matchedUserProfile.studyHabit]?.label}</span>
                  <span className="sm:hidden">学习</span>
                </Badge>
              )}
              
              {matchedUserProfile?.lifestyle && (
                <Badge variant="outline" className="text-xs">
                  <span className="hidden sm:inline">
                    {matchedUserProfile.lifestyle === 'quiet' ? '安静型' : 
                     matchedUserProfile.lifestyle === 'social' ? '社交型' : '平衡型'}
                  </span>
                  <span className="sm:hidden">生活</span>
                </Badge>
              )}
            </div>

            {/* 个人简介预览 */}
            {matchedUserProfile?.bio && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 sm:mb-4">
                {matchedUserProfile.bio}
              </p>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t gap-3 sm:gap-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            <span className="hidden sm:inline">匹配ID: {match.id}</span>
            <span className="sm:hidden">ID: {match.id}</span>
          </div>
          
          <div className="flex space-x-2 sm:space-x-3 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnmatch}
              disabled={isUnmatching}
              className="flex-1 sm:flex-initial hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs sm:text-sm"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{isUnmatching ? '取消中...' : '取消匹配'}</span>
              <span className="sm:hidden">取消</span>
            </Button>
            
            <Button
              size="sm"
              onClick={handleViewMatch}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-xs sm:text-sm"
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">查看匹配</span>
              <span className="sm:hidden">查看</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}