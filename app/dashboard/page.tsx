import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/db/queries';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Users, 
  Heart,
  Settings,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const { user, session } = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const profileCompletionSteps = [
    {
      id: 'basic_info',
      title: '基本信息',
      description: '完善个人基本信息',
      completed: !!user.users?.name,
      href: '/profile'
    },
    {
      id: 'preferences',
      title: '生活偏好',
      description: '设置作息习惯、MBTI等',
      completed: false, // 需要检查 userProfiles 表
      href: '/profile'
    },
    {
      id: 'roommate_expectations',
      title: '室友期待',
      description: '描述理想室友特征',
      completed: false,
      href: '/profile'
    }
  ];

  const completedSteps = profileCompletionSteps.filter(step => step.completed).length;
  const completionPercentage = Math.round((completedSteps / profileCompletionSteps.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                欢迎回来，{user.users?.name}！
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                学号：{user.users?.studentId} | 邮箱：{user.users?.email}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={user.users?.isEmailVerified ? "default" : "destructive"}>
                {user.users?.isEmailVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    已验证
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    未验证
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 个人资料完善进度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  个人资料完善
                </CardTitle>
                <CardDescription>
                  完善资料以获得更好的匹配体验
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 进度条 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">完成进度</span>
                      <span className="text-sm text-gray-500">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 完善步骤 */}
                  <div className="space-y-3">
                    {profileCompletionSteps.map((step) => (
                      <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                          )}
                          <div>
                            <h4 className="font-medium">{step.title}</h4>
                            <p className="text-sm text-gray-500">{step.description}</p>
                          </div>
                        </div>
                        {!step.completed && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={step.href}>
                              完善
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快速操作</CardTitle>
                <CardDescription>
                  开始您的室友匹配之旅
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild className="h-20 flex-col">
                    <Link href="/explore">
                      <Heart className="w-6 h-6 mb-2" />
                      <span>开始匹配</span>
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-20 flex-col">
                    <Link href="/teams">
                      <Users className="w-6 h-6 mb-2" />
                      <span>浏览队伍</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧侧边栏 */}
          <div className="space-y-6">
            {/* 账户状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  账户状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">邮箱验证</span>
                  <Badge variant={user.users?.isEmailVerified ? "default" : "destructive"}>
                    {user.users?.isEmailVerified ? "已验证" : "未验证"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">账户状态</span>
                  <Badge variant={user.users?.isActive ? "default" : "destructive"}>
                    {user.users?.isActive ? "活跃" : "停用"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">注册时间</span>
                  <span className="text-sm text-gray-500">
                    {user.users?.createdAt ? new Date(user.users.createdAt).toLocaleDateString('zh-CN') : '未知'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 最近活动 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  最近活动
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>上次登录</span>
                    <span className="text-gray-500">刚刚</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>资料更新</span>
                    <span className="text-gray-500">暂无</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>匹配活动</span>
                    <span className="text-gray-500">暂无</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速链接 */}
            <Card>
              <CardHeader>
                <CardTitle>快速链接</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/profile">
                    <Settings className="w-4 h-4 mr-2" />
                    个人设置
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/matches">
                    <Heart className="w-4 h-4 mr-2" />
                    我的匹配
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full justify-start">
                  <Link href="/teams">
                    <Users className="w-4 h-4 mr-2" />
                    我的队伍
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}