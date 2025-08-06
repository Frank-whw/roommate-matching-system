import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/db/queries';
import { 
  User, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Edit3,
  Save
} from 'lucide-react';
import { ProfileForm } from '@/components/profile/profile-form';
import Breadcrumb from '@/components/navigation/breadcrumb';
import { breadcrumbConfigs } from '@/lib/breadcrumb-configs';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { user, session } = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const profileComplete = user.user_profiles?.isProfileComplete || false;
  const hasProfile = !!user.user_profiles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 面包屑导航 */}
        <Breadcrumb items={breadcrumbConfigs.profile} className="mb-4" />
        
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <User className="w-8 h-8 mr-3" />
                个人资料管理
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                完善您的个人信息，获得更好的匹配体验
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={profileComplete ? "success" : "warning"}>
                {profileComplete ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    资料完整
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    待完善
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* 用户基本信息展示 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              账户信息
            </CardTitle>
            <CardDescription>
              您的基本账户信息（不可修改）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">学号</label>
                <p className="text-base font-semibold">{user.users?.studentId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">邮箱</label>
                <p className="text-base font-semibold">{user.users?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">姓名</label>
                <p className="text-base font-semibold">{user.users?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 个人资料表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Edit3 className="w-5 h-5 mr-2" />
              个人详细资料
            </CardTitle>
            <CardDescription>
              完善这些信息将帮助您找到更合适的室友
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm 
              user={user} 
              hasProfile={hasProfile}
              initialProfile={user.user_profiles} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}