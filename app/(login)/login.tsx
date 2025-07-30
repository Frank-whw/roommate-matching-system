'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { signIn, signUp, resendVerificationEmail } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { siteConfig } from '@/lib/config';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showResendForm, setShowResendForm] = useState(false);
  
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  const [resendState, resendAction, resendPending] = useActionState<ActionState, FormData>(
    resendVerificationEmail,
    { error: '' }
  );

  // 检查是否需要邮箱验证
  const needsEmailVerification = state.needEmailVerification;
  const isSuccess = state.success;

  if (needsEmailVerification || showResendForm) {
    return <EmailVerificationForm 
      onBack={() => setShowResendForm(false)}
      resendState={resendState}
      resendAction={resendAction}
      resendPending={resendPending}
    />;
  }

  if (isSuccess && mode === 'signup') {
    return <RegistrationSuccess message={state.message || ''} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">{siteConfig.name}</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {mode === 'signin' ? '登录您的账户' : '注册新账户'}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === 'signin' 
            ? '找到理想室友，从登录开始' 
            : '开始您的室友匹配之旅'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'signin' ? '用户登录' : '用户注册'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? '使用学号或邮箱登录' 
                : '请填写以下信息完成注册'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-4" action={formAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              
              {mode === 'signup' && (
                <>
                  <div>
                    <Label htmlFor="studentId" className="text-sm font-medium">
                      学号 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      type="text"
                      placeholder="请输入学号 (102*55014**格式)"
                      required
                      maxLength={20}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      学号格式：102开头，55014结尾，如：1020055014XX<br/>
                      邮箱将自动生成为：学号@stu.ecnu.edu.cn
                    </p>
                  </div>
                </>
              )}

              {mode === 'signin' && (
                <div>
                  <Label htmlFor="identifier" className="text-sm font-medium">
                    学号/邮箱 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="请输入学号或邮箱"
                    required
                    maxLength={255}
                    className="mt-1"
                  />
                </div>
              )}

              {mode === 'signin' && (
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    密码 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    maxLength={100}
                    className="mt-1"
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div className="flex items-center space-x-2">
                  <Checkbox id="agreeToTerms" name="agreeToTerms" value="true" required />
                  <Label 
                    htmlFor="agreeToTerms" 
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    我已阅读并同意
                    <Link href="/terms" className="text-primary hover:underline mx-1">
                      用户协议
                    </Link>
                    和
                    <Link href="/privacy" className="text-primary hover:underline mx-1">
                      隐私政策
                    </Link>
                  </Label>
                </div>
              )}

              {(state.error || state.message) && (
                <Alert className={state.error ? 'border-destructive' : 'border-green-500'}>
                  {state.error ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {state.error || state.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {mode === 'signin' ? '登录中...' : '注册中...'}
                  </>
                ) : (
                  mode === 'signin' ? '登录' : '注册'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  {mode === 'signin' ? '还没有账户？' : '已有账户？'}
                </span>
              </div>
            </div>

            <div className="flex flex-col w-full space-y-2">
              <Button variant="outline" asChild>
                <Link 
                  href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                    redirect ? `?redirect=${redirect}` : ''
                  }`}
                >
                  {mode === 'signin' ? '注册新账户' : '登录现有账户'}
                </Link>
              </Button>

              {mode === 'signin' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowResendForm(true)}
                  type="button"
                >
                  重新发送验证邮件
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// 邮箱验证组件
function EmailVerificationForm({ 
  onBack, 
  resendState, 
  resendAction, 
  resendPending 
}: {
  onBack: () => void;
  resendState: any;
  resendAction: any;
  resendPending: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Mail className="h-16 w-16 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          邮箱验证
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">请验证您的邮箱</CardTitle>
            <CardDescription className="text-center">
              验证邮件已发送至您的邮箱，请点击邮件中的链接完成验证
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form action={resendAction} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  如需重新发送验证邮件，请输入邮箱地址
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  required
                  className="mt-1"
                />
              </div>

              {(resendState.error || resendState.message) && (
                <Alert className={resendState.error ? 'border-destructive' : 'border-green-500'}>
                  {resendState.error ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {resendState.error || resendState.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={resendPending}
                variant="outline"
              >
                {resendPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    发送中...
                  </>
                ) : (
                  '重新发送验证邮件'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onBack}
              type="button"
            >
              返回登录
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// 注册成功组件
function RegistrationSuccess({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          注册成功！
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">欢迎加入室友匹配系统</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <Alert className="border-green-500">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            
            <p className="text-sm text-muted-foreground">
              请检查您的邮箱（包括垃圾邮件文件夹），点击验证链接后即可登录使用。
            </p>
          </CardContent>

          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/sign-in">
                前往登录
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}