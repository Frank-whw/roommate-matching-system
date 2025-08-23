'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';
import { tempRegister } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { siteConfig } from '@/lib/config';

export function TempRegister() {
  const [state, setState] = useState<ActionState>({ error: '' });
  const [isPending, startTransition] = useTransition();
  
  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await tempRegister(state, formData);
      setState(result as ActionState);
    });
  };

  const isSuccess = state?.success || false;

  return isSuccess ? (
    <RegistrationSuccess message={state?.message || ''} isResent={false} />
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>🚀 临时注册</CardTitle>
        <CardDescription>
          输入基本信息直接创建账户，无需邮箱验证
        </CardDescription>
        <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-lg text-sm">
          <p className="text-blue-700 dark:text-blue-300 mb-1">
            📋 <strong>考虑不周</strong>
            <br />
            🔧 目前处于内测阶段，欢迎反馈使用体验和问题
            <br />
            💡 提前找到志同道合的室友，正式选宿舍时可以直接组队
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            ❓ <strong>无法注册？</strong>请联系管理员微信：<code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">daydreamer88866</code>
          </p>
          <p className="text-blue-700 dark:text-blue-300">
            ❓ <strong>bug反馈</strong>请联系：<code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">_Frankiss</code>
          </p>
        </div>
      </CardHeader>
      
      <CardContent>
        <form className="space-y-4" action={handleFormAction}>
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
              💡 10255501XXX格式，确保学号正确
            </p>
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              🔒 设置密码 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="至少8位，包含字母和数字"
              required
              minLength={8}
              maxLength={100}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              👤 用户名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="请输入你的姓名或昵称"
              required
              maxLength={50}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="gender" className="text-sm font-medium">
              ⚧ 性别 <span className="text-destructive">*</span>
            </Label>
            <Select name="gender" required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="请选择性别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男</SelectItem>
                <SelectItem value="female">女</SelectItem>
                <SelectItem value="other">其他</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(state?.error || state?.message) && (
            <Alert className={state?.error ? 'border-destructive' : 'border-green-500'}>
              {state?.error ? (
                <AlertCircle className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
              ) : (
                <CheckCircle className="h-4 w-4" style={{ fill: 'none', stroke: 'currentColor' }} />
              )}
              <AlertDescription>
                {state?.error || state?.message}
                {state?.error && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    💬 注册失败？请联系管理员微信：<code>daydreamer88866</code>
                  </div>
                )}
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
                注册中...
              </>
            ) : (
              '立即注册'
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
              已有账户？
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full space-y-2">
          <Button variant="outline" asChild>
            <Link href="/sign-in">
              返回正常登录
            </Link>
          </Button>
          
          <Button variant="ghost" asChild>
            <Link href="/sign-up">
              使用邮箱注册
            </Link>
          </Button>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>💡 临时注册账户后续可绑定教育邮箱</p>
            <p>🔧 技术问题请联系：<code>RoomieSync_Admin</code></p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

function RegistrationSuccess({ message, isResent }: { message: string; isResent: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" style={{ fill: 'none', stroke: 'currentColor' }} />
        </div>
        <CardTitle className="text-center text-green-600">
          🎉 注册成功！
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 你现在可以直接登录系统，开始完善个人资料和匹配室友了！
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/sign-in">
            立即登录
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}