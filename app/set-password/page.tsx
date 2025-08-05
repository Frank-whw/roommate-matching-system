'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';

function SetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // 验证密码强度
  const validatePassword = (pwd: string) => {
    const errors = [];
    if (pwd.length < 8) errors.push('至少8个字符');
    if (!/[A-Z]/.test(pwd)) errors.push('至少包含一个大写字母');
    if (!/[a-z]/.test(pwd)) errors.push('至少包含一个小写字母');
    if (!/\d/.test(pwd)) errors.push('至少包含一个数字');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('无效的设置密码链接');
      return;
    }

    // 验证密码
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`密码不符合要求：${passwordErrors.join('，')}`);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage(data.message || '密码设置成功！');
      } else {
        setError(data.error || '设置密码失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Lock className="h-16 w-16 text-destructive" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            无效链接
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">链接无效或已过期</CardTitle>
              <CardDescription className="text-center">
                请重新申请设置密码邮件
              </CardDescription>
            </CardHeader>
            
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/sign-up">
                  重新注册
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md" suppressHydrationWarning>
        <div className="flex justify-center">
          <Lock className="h-16 w-16 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground" suppressHydrationWarning>
          {success ? '设置成功' : '设置密码'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center" suppressHydrationWarning>
              {success ? '密码设置成功' : '请设置您的登录密码'}
            </CardTitle>
            <CardDescription className="text-center">
              {success 
                ? '您现在可以使用新密码登录系统'
                : '密码需要至少8个字符，包含大小写字母和数字'
              }
            </CardDescription>
          </CardHeader>
          
          {!success ? (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    新密码 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入新密码"
                    required
                    minLength={8}
                    maxLength={100}
                    className="mt-1"
                  />
                  {password && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {validatePassword(password).length === 0 ? (
                        <span className="text-green-600">✓ 密码强度符合要求</span>
                      ) : (
                        <span className="text-destructive">
                          还需要：{validatePassword(password).join('，')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    确认密码 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    required
                    minLength={8}
                    maxLength={100}
                    className="mt-1"
                  />
                  {confirmPassword && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {password === confirmPassword ? (
                        <span className="text-green-600">✓ 密码一致</span>
                      ) : (
                        <span className="text-destructive">✗ 密码不一致</span>
                      )}
                    </div>
                  )}
                </div>

                {(error || message) && (
                  <Alert className={error ? 'border-destructive' : 'border-green-500'}>
                    {error ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {error || message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      设置中...
                    </>
                  ) : (
                    '设置密码'
                  )}
                </Button>
              </form>
            </CardContent>
          ) : (
            <CardContent>
              <Alert className="border-green-500">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
            </CardContent>
          )}

          <CardFooter className="flex flex-col space-y-2">
            {success ? (
              <Button asChild className="w-full">
                <Link href="/sign-in">
                  立即登录
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" asChild className="w-full">
                <Link href="/sign-up">
                  返回注册
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">
                返回首页
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetPasswordContent />
    </Suspense>
  );
}