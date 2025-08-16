'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [step, setStep] = useState<'request' | 'reset'>(
    token ? 'reset' : 'request'
  );
  
  // 请求重置密码状态
  const [studentId, setStudentId] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestResult, setRequestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // 重置密码状态
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 发送重置密码邮件
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;
    
    setIsRequesting(true);
    setRequestResult(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim() })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setRequestResult({ success: true, message: result.message });
        setStep('reset');
      } else {
        setRequestResult({ success: false, message: result.error });
      }
    } catch (error) {
      setRequestResult({ 
        success: false, 
        message: '网络错误，请稍后重试' 
      });
    } finally {
      setIsRequesting(false);
    }
  };

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setResetResult({ success: false, message: '两次输入的密码不一致' });
      return;
    }
    
    setIsResetting(true);
    setResetResult(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setResetResult({ success: true, message: result.message });
      } else {
        setResetResult({ success: false, message: result.error });
      }
    } catch (error) {
      setResetResult({ 
        success: false, 
        message: '网络错误，请稍后重试' 
      });
    } finally {
      setIsResetting(false);
    }
  };

  // 密码强度检查
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password)
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    return { checks, passed, total: Object.keys(checks).length };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 'request' ? '重置密码' : '设置新密码'}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              {step === 'request' 
                ? '请输入您的学号，我们将发送重置密码邮件到您的邮箱'
                : '请设置您的新密码'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 'request' ? (
              // 第一步：请求重置密码
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-sm font-medium">
                    学号
                  </Label>
                  <div className="relative">
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="请输入您的学号（如：1025501401）"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="pl-10 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                
                {requestResult && (
                  <Alert className={requestResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {requestResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={requestResult.success ? 'text-green-800' : 'text-red-800'}>
                      {requestResult.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
                  disabled={isRequesting || !studentId.trim()}
                >
                  {isRequesting ? '发送中...' : '发送重置邮件'}
                </Button>
                
                <div className="text-center">
                  <Link 
                    href="/sign-in" 
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    返回登录
                  </Link>
                </div>
              </form>
            ) : (
              // 第二步：重置密码
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    新密码
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入新密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* 密码强度指示器 */}
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                        <div
                          key={key}
                          className={`h-1 flex-1 rounded ${
                            passed ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-500'}>
                        ✓ 至少8个字符
                      </div>
                      <div className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-500'}>
                        ✓ 包含大写字母
                      </div>
                      <div className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-500'}>
                        ✓ 包含小写字母
                      </div>
                      <div className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-500'}>
                        ✓ 包含数字
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    确认密码
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="请再次输入新密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-red-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {resetResult && (
                  <Alert className={resetResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {resetResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={resetResult.success ? 'text-green-800' : 'text-red-800'}>
                      {resetResult.message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
                  disabled={isResetting || !password || !confirmPassword || password !== confirmPassword}
                >
                  {isResetting ? '重置中...' : '重置密码'}
                </Button>
                
                {resetResult?.success && (
                  <div className="text-center">
                    <Link 
                      href="/sign-in" 
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      返回登录
                    </Link>
                  </div>
                )}
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    重新发送重置邮件
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
