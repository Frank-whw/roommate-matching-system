'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { signIn, signUp, resendVerificationEmail } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { siteConfig } from '@/lib/config';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showResendForm, setShowResendForm] = useState(false);
  
  const [state, setState] = useState<ActionState>({ error: '' });
  const [isPending, startTransition] = useTransition();
  
  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
      const action = mode === 'signin' ? signIn : signUp;
      const result = await action(state, formData);
      setState(result as ActionState);
    });
  };

  const [resendState, setResendState] = useState<ActionState>({ error: '' });
  const [isResendPending, startResendTransition] = useTransition();
  
  const handleResendAction = (formData: FormData) => {
    startResendTransition(async () => {
      const result = await resendVerificationEmail(resendState, formData);
      setResendState(result as ActionState);
    });
  };

  // 检查是否需要邮箱验证
  const needsEmailVerification = state?.needEmailVerification || false;
  const isSuccess = state?.success || false;

  if (needsEmailVerification || showResendForm) {
    return <EmailVerificationForm 
      onBack={() => setShowResendForm(false)}
      resendState={resendState}
      resendAction={handleResendAction}
      resendPending={isResendPending}
    />;
  }

  if (isSuccess && mode === 'signup') {
    // 检查是否是重新发送的情况
    const isResent = state?.data?.resent === true;
    return <RegistrationSuccess message={state?.message || ''} isResent={isResent} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" style={{ fill: 'none', stroke: 'currentColor' }} />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {siteConfig.name}
            </span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {mode === 'signin' ? '🎉 欢迎回来！' : '🚀 开启你的匹配之旅'}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {mode === 'signin' 
            ? '继续寻找你的理想室友吧' 
            : '几分钟创建账户，遇见最合拍的室友'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'signin' ? '🔐 立即登录' : '✨ 创建账户'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? '使用你的华师大学号或邮箱快速登录' 
                : '加入RoomieSync社区，开始智能匹配'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form className="space-y-4" action={handleFormAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              
              {mode === 'signup' && (
                <>
                  <div>
                    <Label htmlFor="studentId" className="text-sm font-medium">
                      🎓 华师大学号 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="studentId"
                      name="studentId"
                      type="text"
                      placeholder="例如：10255501401"
                      required
                      maxLength={20}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 输入你的学号，我们会发送邮件到教育邮箱<br/>
                      ⚠️ 转专业和插班生学号格式特殊请私信管理员
                    </p>
                  </div>
                </>
              )}

              {mode === 'signin' && (
                <div>
                  <Label htmlFor="identifier" className="text-sm font-medium">
                    🔑 学号或邮箱 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="输入学号或邮箱地址"
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
                  <Label htmlFor="agreeToTerms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    我同意
                    <Link href="/terms" className="text-primary hover:underline ml-1">
                      用户协议
                    </Link>
                    和
                    <Link href="/privacy" className="text-primary hover:underline ml-1">
                      隐私政策
                    </Link>
                  </Label>
                </div>
              )}

              {(state?.error || state?.message) && (
                <Alert className={state?.error ? 'border-destructive' : 'border-green-500'}>
                  {state?.error ? (
                    <AlertCircle className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
                  ) : (
                    <CheckCircle className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
                  )}
                  <AlertDescription>
                    {state?.error || state?.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Mail className="h-16 w-16 text-primary" style={{ fill: 'none', stroke: 'currentColor' }} />
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

              {(resendState?.error || resendState?.message) && (
                <Alert className={resendState?.error ? 'border-destructive' : 'border-green-500'}>
                  {resendState?.error ? (
                    <AlertCircle className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
                  ) : (
                    <CheckCircle className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
                  )}
                  <AlertDescription>
                    {resendState?.error || resendState?.message}
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
                    <Loader2 className="animate-spin mr-2 h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
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
              onClick={onBack}
              className="w-full"
              type="button"
            >
              ⬅️ 返回登录
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// 注册成功组件
function RegistrationSuccess({ message, isResent }: { message: string; isResent: boolean }) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {isResent ? '验证邮件已重新发送' : '注册申请已提交'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">
              🎉 操作成功！
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 提示：请检查您的邮箱（包括垃圾邮件文件夹），点击验证链接完成注册。
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/sign-in">
                返回登录
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}