import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getUserWithProfile } from '@/lib/db/queries';

// 强制动态渲染
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft,
  Heart,
  GraduationCap,
  MapPin,
  Clock,
  Brain,
  Home,
  Sparkles,
  User,
  Mail,
  IdCard,
  Sun,
  Moon,
  Coffee
} from 'lucide-react';

interface UserDetailsPageProps {
  params: Promise<{ id: string }>;
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

const genderLabels: { [key: string]: string } = {
  'male': '男',
  'female': '女',
  'other': '其他'
};

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { user: currentUser } = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const userId = parseInt(id);
  
  if (isNaN(userId)) {
    notFound();
  }

  const targetUser = await getUserWithProfile(userId);
  
  if (!targetUser) {
    notFound();
  }

  const profile = targetUser.user_profiles;
  const user = targetUser.users;

  const StudyHabitIcon = profile?.studyHabit ? studyHabitLabels[profile.studyHabit]?.icon || Coffee : Coffee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/explore" className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回匹配广场
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：用户基本信息 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Avatar className="w-24 h-24 mx-auto ring-4 ring-pink-100 dark:ring-pink-900">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}&background=f97316&color=fff&size=200`} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xl">
                      {user.name ? user.name.substring(0, 2) : user.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {user.name || '用户' + user.id}
                </h1>
                
                <Badge variant="outline" className="mb-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  活跃用户
                </Badge>

                {/* 基本信息 */}
                <div className="space-y-3 text-sm">
                  {profile?.gender && (
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4 mr-2" />
                      <span>{genderLabels[profile.gender]}</span>
                    </div>
                  )}
                  
                  {profile?.age && (
                    <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <span>{profile.age}岁</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{user.email.replace(/(.{2}).*(@.*)/, '$1***$2')}</span>
                  </div>

                  <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <IdCard className="w-4 h-4 mr-2" />
                    <span>{user.studentId.replace(/(.{3}).*(.{2})/, '$1***$2')}</span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-6 space-y-3">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                    <Heart className="w-4 h-4 mr-2" />
                    喜欢Ta
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/matches?userId=${user.id}`}>
                      <User className="w-4 h-4 mr-2" />
                      查看详情
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：详细信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 学业信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  学业信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">学院/专业</label>
                    <p className="text-gray-900 dark:text-white">待完善</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">年级</label>
                    <p className="text-gray-900 dark:text-white">待完善</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    宿舍区域
                  </label>
                  <p className="text-gray-900 dark:text-white">待完善</p>
                </div>
              </CardContent>
            </Card>

            {/* 生活习惯 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  生活习惯
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {profile?.mbti && (
                    <Badge variant="outline" className="text-sm">
                      <Brain className="w-4 h-4 mr-1" />
                      {profile.mbti} {mbtiDescriptions[profile.mbti]}
                    </Badge>
                  )}
                  
                  {profile?.studyHabit && (
                    <Badge variant="outline" className="text-sm">
                      <StudyHabitIcon className="w-4 h-4 mr-1" />
                      {studyHabitLabels[profile.studyHabit]?.label}
                    </Badge>
                  )}
                  
                  {profile?.lifestyle && (
                    <Badge variant="outline" className="text-sm">
                      <Home className="w-4 h-4 mr-1" />
                      {lifestyleLabels[profile.lifestyle]}
                    </Badge>
                  )}
                  
                  {profile?.cleanliness && (
                    <Badge variant="outline" className="text-sm">
                      <Sparkles className="w-4 h-4 mr-1" />
                      {cleanlinessLabels[profile.cleanliness]}
                    </Badge>
                  )}
                </div>

                {(profile?.sleepTime || profile?.wakeTime) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      作息时间
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {profile.sleepTime || '未填写'} - {profile.wakeTime || '未填写'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 个人简介 */}
            {profile?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    个人简介
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 兴趣爱好 */}
            {profile?.hobbies && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    兴趣爱好
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {profile.hobbies}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 室友期望 */}
            {profile?.roommateExpectations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    室友期望
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {profile.roommateExpectations}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}