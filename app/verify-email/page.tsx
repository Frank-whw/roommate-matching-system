'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Home } from 'lucide-react';
import { verifyEmail } from '@/app/(login)/actions';
import { siteConfig } from '@/lib/config';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationState, setVerificationState] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    message: string | null;
  }>({
    loading: true,
    success: false,
    error: null,
    message: null
  });

  useEffect(() => {
    if (!token) {
      setVerificationState({
        loading: false,
        success: false,
        error: '验证链接无效',
        message: null
      });
      return;
    }

    const performVerification = async () => {
      try {
        const formData = new FormData();
        formData.append('token', token);
        
        const result = await verifyEmail({}, formData);
        
        setVerificationState({
          loading: false,
          success: !!(result as any).success,
          error: (result as any).error || null,
          message: (result as any).message || null
        });
      } catch (error) {
        setVerificationState({
          loading: false,
          success: false,
          error: '验证过程出现错误，请重试',
          message: null
        });
      }
    };

    performVerification();
  }, [token]);

  const { loading, success, error, message } = verificationState;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center space-x-2 mb-6">
          <Home className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">{siteConfig.name}</span>
        </div>
        
        <div className="flex justify-center mb-6">
          {loading ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          ) : success ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive" />
          )}
        </div>

        <h2 className="text-center text-3xl font-extrabold text-foreground mb-2">
          {loading ? '正在验证...' : success ? '验证成功！' : '验证失败'}
        </h2>
        
        <p className="text-center text-sm text-muted-foreground">
          {loading 
            ? '请稍候，正在验证您的邮箱...' 
            : success 
              ? '您的邮箱已成功验证，现在可以正常使用了'
              : '邮箱验证失败，请检查验证链接是否正确'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {loading ? '邮箱验证中' : success ? '欢迎加入' : '验证失败'}
            </CardTitle>
            <CardDescription className="text-center">
              {loading 
                ? '正在处理验证请求...' 
                : success 
                  ? '您现在可以登录并开始使用室友匹配系统'
                  : '请检查验证链接或重新申请验证邮件'
              }
            </CardDescription>
          </CardHeader>

          {!loading && (
            <CardContent>
              {(error || message) && (
                <Alert className={error ? 'border-destructive' : 'border-green-500'}>
                  {error ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {error || message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          )}

          {!loading && (
            <CardFooter className="flex flex-col space-y-2">
              {success ? (
                <Button asChild className="w-full">
                  <Link href="/sign-in">
                    立即登录
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="w-full">
                    <Link href="/sign-in">
                      重新发送验证邮件
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/sign-up">
                      重新注册
                    </Link>
                  </Button>
                </>
              )}
              
              <Button variant="ghost" asChild className="w-full">
                <Link href="/">
                  返回首页
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}