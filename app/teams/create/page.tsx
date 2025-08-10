import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/db/queries';
import { CreateTeamForm } from '@/components/teams/create-team-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  Users,
  Crown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import Breadcrumb from '@/components/navigation/breadcrumb';
import { breadcrumbConfigs } from '@/lib/breadcrumb-configs';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export default async function CreateTeamPage() {
  const { user, session } = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbConfigs.createTeam} className="mb-4" />
        
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/teams">
                  <ArrowLeft className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  返回队伍
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Crown className="w-8 h-8 mr-3 text-yellow-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                  创建队伍
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  组建4人室友团队，找到最适合的室友
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容 - 创建表单 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  队伍信息
                </CardTitle>
                <CardDescription>
                  填写队伍基本信息，组建4人室友团队
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateTeamForm />
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 - 提示信息 */}
          <div className="space-y-6">
            {/* 创建须知 */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800 dark:text-blue-200">
                  <AlertCircle className="w-5 h-5 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  创建须知
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700 dark:text-blue-300">
                <ul className="space-y-2">
                  <li>• 创建后您将自动成为队长</li>
                  <li>• 队伍固定为4名成员</li>
                  <li>• 您需要审核其他用户的加入申请</li>
                  <li>• 可以随时修改队伍信息</li>
                  <li>• 每人只能同时在一个队伍中</li>
                </ul>
              </CardContent>
            </Card>

            {/* 队长权限 */}
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800 dark:text-green-200">
                  <Crown className="w-5 h-5 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  队长权限
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-green-700 dark:text-green-300">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                    审批加入申请
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                    移除队伍成员
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                    修改队伍信息
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                    解散队伍
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
                    转让队长职位
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 填写建议 */}
            <Card>
              <CardHeader>
                <CardTitle>💡 填写建议</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">队伍名称</h4>
                    <p>简洁明了，体现团队特色或目标</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">队伍描述</h4>
                    <p>详细介绍队伍文化和氛围，帮助他人了解</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">招募要求</h4>
                    <p>明确期望的室友特质和生活习惯</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 示例展示 */}
            <Card>
              <CardHeader>
                <CardTitle>✨ 优秀示例</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">学霸联盟</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    我们是一群热爱学习的同学，希望在宿舍营造良好的学习氛围...
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    招募要求：早睡早起、不在宿舍大声喧哗、共同维护整洁环境
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}