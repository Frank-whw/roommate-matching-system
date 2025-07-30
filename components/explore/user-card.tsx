'use client';

import { useState } from 'react';
import { likeUser } from '@/app/explore/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart,
  X,
  Clock,
  GraduationCap,
  Home,
  Brain,
  MapPin,
  MessageCircle,
  Sparkles,
  Moon,
  Sun,
  Coffee,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UserCardProps {
  user: any;
  profile: any;
  currentUserId: number;
}

const mbtiDescriptions: { [key: string]: string } = {
  'INTJ': '建筑师', 'INTP': '逻辑学家', 'ENTJ': '指挥官', 'ENTP': '辩论家',
  'INFJ': '提倡者', 'INFP': '调停者', 'ENFJ': '主人公', 'ENFP': '竞选者',
  'ISTJ': '物流师', 'ISFJ': '守护者', 'ESTJ': '总经理', 'ESFJ': '执政官',
  'ISTP': '鉴赏家', 'ISFP': '探险家', 'ESTP': '企业家', 'ESFP': '娱乐家'
};

const studyHabitLabels: { [key: string]: { label: string; icon: any } } = {
  'early_bird': { label: '早起学习', icon: Sun },
  'night_owl': { label: '夜猫子', icon: Moon },
  'flexible': { label: '灵活安排', icon: Coffee }
};

const lifestyleLabels: { [key: string]: string } = {
  'quiet': '安静型',
  'social': '社交型',
  'balanced': '平衡型'
};

const cleanlinessLabels: { [key: string]: string } = {
  'very_clean': '非常整洁',
  'clean': '比较整洁',
  'moderate': '一般'
};

export function UserCard({ user, profile, currentUserId }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPassing, setIsPassing] = useState(false);

  // 处理点赞
  const handleLike = async () => {
    setIsLiking(true);
    try {
      const result = await likeUser({
        targetUserId: user.id,
        isLike: true
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        if (result.matchCreated) {
          alert('🎉 匹配成功！你们互相喜欢，可以开始聊天了！');
        } else {
          alert('❤️ 已点赞，等待对方回应...');
        }
        // 隐藏当前卡片或刷新页面
        window.location.reload();
      }
    } catch (error) {
      console.error('点赞失败:', error);
      alert('点赞失败，请重试');
    } finally {
      setIsLiking(false);
    }
  };

  // 处理跳过
  const handlePass = async () => {
    setIsPassing(true);
    try {
      const result = await likeUser({
        targetUserId: user.id,
        isLike: false
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        // 隐藏当前卡片或刷新页面
        window.location.reload();
      }
    } catch (error) {
      console.error('跳过失败:', error);
      alert('跳过失败，请重试');
    } finally {
      setIsPassing(false);
    }
  };

  // 不再使用匹配度，由用户自主选择
  const StudyHabitIcon = profile?.studyHabit ? studyHabitLabels[profile.studyHabit]?.icon || Coffee : Coffee;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <CardContent className="p-0">
        {/* 用户头部信息 */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <div className="relative flex-shrink-0">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-pink-100 dark:ring-pink-900">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=f97316&color=fff`} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                  {user.name ? user.name.substring(0, 2) : user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* 在线状态指示器 */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white truncate pr-2">
                  {user.name || '用户' + user.id}
                </h3>
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 flex-shrink-0">
                  <Sparkles className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">新用户</span>
                  <span className="sm:hidden">新</span>
                </Badge>
              </div>
              
              <div className="mt-1 space-y-1">
                <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <GraduationCap className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{profile?.major || '未知专业'}</span>
                  <span className="mx-1 flex-shrink-0">•</span>
                  <span className="truncate">{profile?.grade || '未知年级'}</span>
                </div>
                
                {profile?.dormArea && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{profile.dormArea}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 用户标签和信息 */}
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 space-y-3">
          {/* MBTI和生活习惯标签 */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {profile?.mbti && (
              <Badge variant="outline" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{profile.mbti} {mbtiDescriptions[profile.mbti]}</span>
                <span className="sm:hidden">{profile.mbti}</span>
              </Badge>
            )}
            
            {profile?.studyHabit && (
              <Badge variant="outline" className="text-xs">
                <StudyHabitIcon className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{studyHabitLabels[profile.studyHabit]?.label}</span>
                <span className="sm:hidden">学习</span>
              </Badge>
            )}
            
            {profile?.lifestyle && (
              <Badge variant="outline" className="text-xs">
                <Home className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">{lifestyleLabels[profile.lifestyle]}</span>
                <span className="sm:hidden">生活</span>
              </Badge>
            )}
          </div>

          {/* 作息时间 */}
          {(profile?.sleepTime || profile?.wakeTime) && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">作息: </span>
                {profile.sleepTime || '??:??'} - {profile.wakeTime || '??:??'}
              </span>
            </div>
          )}

          {/* 个人简介 */}
          {profile?.bio && (
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <p className={`${isExpanded ? '' : 'line-clamp-2'}`}>
                {profile.bio}
              </p>
              {profile.bio.length > 80 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-pink-500 hover:text-pink-600 text-xs mt-1 flex items-center"
                >
                  {isExpanded ? (
                    <>收起 <ChevronUp className="w-3 h-3 ml-1" /></>
                  ) : (
                    <>展开 <ChevronDown className="w-3 h-3 ml-1" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* 兴趣爱好 */}
          {profile?.hobbies && (
            <div className="text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-400">兴趣: </span>
              <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{profile.hobbies}</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex space-x-2 sm:space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-xs sm:text-sm"
              onClick={handlePass}
              disabled={isPassing}
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{isPassing ? '跳过中...' : '跳过'}</span>
            </Button>
            
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-xs sm:text-sm"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
              <span className="hidden sm:inline">{isLiking ? '喜欢中...' : '喜欢'}</span>
            </Button>
            
            <Button variant="outline" size="sm" className="px-2 sm:px-3">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* 悬浮时的额外信息 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
        
        {/* 去除匹配度高亮，由用户自主选择 */}
      </CardContent>
    </Card>
  );
}