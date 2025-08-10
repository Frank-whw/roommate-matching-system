'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, User } from 'lucide-react';

interface ProfileGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function ProfileGuard({ children, requireProfile = true }: ProfileGuardProps) {
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!requireProfile) {
      setIsLoading(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setIsProfileComplete(data.isProfileComplete || false);
        } else {
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error('检查个人资料失败:', error);
        setIsProfileComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [requireProfile]);

  if (!requireProfile) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" style={{ fill: 'none', stroke: 'currentColor' }} />
              </div>
              <CardTitle>完善个人资料</CardTitle>
              <CardDescription>
                请先完善您的个人资料，才能使用匹配功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>为了提供更好的室友匹配服务，我们需要您提供以下信息：</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>微信号</li>
                  <li>性别和年龄</li>
                  <li>作息时间</li>
                  <li>生活习惯</li>
                  <li>个性特征</li>
                  <li>室友期待</li>
                  <li>兴趣爱好</li>
                </ul>
              </div>
              <Button 
                onClick={() => router.push('/profile')} 
                className="w-full"
              >
                <User className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                完善个人资料
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}