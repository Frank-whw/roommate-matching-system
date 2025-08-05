'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Loader2, CheckCircle } from 'lucide-react';
import { InputField, CheckboxField } from '@/components/ui/form-field';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useFormValidation } from '@/lib/validation/client';
import { authSchemas } from '@/lib/validation/schemas';
import { handleApiCall } from '@/lib/errors/handler';
import { AppError } from '@/lib/errors/types';
import { siteConfig } from '@/lib/config';

interface LoginFormProps {
  mode: 'signin' | 'signup';
}

interface LoginFormData {
  studentId: string;
  password: string;
}

interface RegisterFormData {
  studentId: string;
  agreeToTerms: boolean;
}

export function LoginForm({ mode }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<AppError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 表单状态
  const [loginData, setLoginData] = useState<LoginFormData>({
    studentId: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterFormData>({
    studentId: '',
    agreeToTerms: false
  });

  // 表单验证
  const loginValidation = useFormValidation(authSchemas.login);
  const registerValidation = useFormValidation(authSchemas.register);

  const currentValidation = mode === 'signin' ? loginValidation : registerValidation;
  const currentData = mode === 'signin' ? loginData : registerData;

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 客户端验证
    const validationResult = currentValidation.validateForm(currentData);
    if (!validationResult.isValid) {
      return;
    }

    startTransition(async () => {
      try {
        if (mode === 'signin') {
          // 登录请求
          const response = await handleApiCall<{
            success: boolean;
            message: string;
            data?: { user: any };
          }>(() =>
            fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentId: loginData.studentId,
                password: loginData.password
              })
            })
          );

          if (response.success) {
            setSuccess(response.message);
            // 登录成功，跳转
            setTimeout(() => {
              router.push(redirect || '/dashboard');
            }, 1000);
          }
        } else {
          // 注册请求
          const response = await handleApiCall<{
            success: boolean;
            message: string;
            data?: any;
          }>(() =>
            fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(registerData)
            })
          );

          if (response.success) {
            setSuccess(response.message);
          }
        }
      } catch (err) {
        setError(err as AppError);
      }
    });
  };

  // 字段变更处理
  const handleLoginFieldChange = (field: keyof LoginFormData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }));
    loginValidation.validateField(field, value);
  };

  const handleRegisterFieldChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    registerValidation.validateField(field, value);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* 头部 */}
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

      {/* 表单 */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'signin' ? '用户登录' : '用户注册'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? '使用学号和密码登录' 
                : '请填写以下信息完成注册'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 学号字段 */}
              <InputField
                label="学号"
                type="text"
                value={mode === 'signin' ? loginData.studentId : registerData.studentId}
                onChange={(value) => 
                  mode === 'signin' 
                    ? handleLoginFieldChange('studentId', value as string)
                    : handleRegisterFieldChange('studentId', value as string)
                }
                onBlur={() => currentValidation.validateField('studentId', currentData.studentId)}
                placeholder={mode === 'signin' ? '请输入学号' : '请输入学号 (102*55014**格式)'}
                required
                maxLength={20}
                error={currentValidation.errors.studentId}
                description={mode === 'signup' ? '学号格式：102开头，55014结尾，如：1020055014XX。邮箱将自动生成为：学号@stu.ecnu.edu.cn' : undefined}
              />

              {/* 密码字段（仅登录） */}
              {mode === 'signin' && (
                <InputField
                  label="密码"
                  type="password"
                  value={loginData.password}
                  onChange={(value) => handleLoginFieldChange('password', value as string)}
                  onBlur={() => loginValidation.validateField('password', loginData.password)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  required
                  error={loginValidation.errors.password}
                />
              )}

              {/* 同意条款（仅注册） */}
              {mode === 'signup' && (
                <CheckboxField
                  checked={registerData.agreeToTerms}
                  onChange={(checked) => handleRegisterFieldChange('agreeToTerms', checked)}
                  error={registerValidation.errors.agreeToTerms}
                  required
                >
                  我已阅读并同意
                  <Link href="/terms" className="text-primary hover:underline mx-1">
                    用户协议
                  </Link>
                  和
                  <Link href="/privacy" className="text-primary hover:underline mx-1">
                    隐私政策
                  </Link>
                </CheckboxField>
              )}

              {/* 错误和成功消息 */}
              <ErrorDisplay 
                error={error} 
                onDismiss={() => setError(null)}
                onRetry={error?.retry ? () => handleSubmit({ preventDefault: () => {} } as React.FormEvent) : undefined}
              />

              {success && (
                <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
                </div>
              )}

              {/* 提交按钮 */}
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !currentValidation.isValid}
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {mode === 'signin' ? '登录中...' : '注册中...'}
                  </>
                ) : (
                  mode === 'signin' ? '登录' : '注册'
                )}
              </Button>
            </form>

            {/* 切换链接 */}
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">
                    {mode === 'signin' ? '还没有账户？' : '已有账户？'}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link 
                    href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                      redirect ? `?redirect=${redirect}` : ''
                    }`}
                  >
                    {mode === 'signin' ? '注册新账户' : '登录现有账户'}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}