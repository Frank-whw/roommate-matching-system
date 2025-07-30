'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealtimeTest } from '@/components/realtime/realtime-test';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results = [];

    // 测试1：API连接测试
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      results.push({
        test: 'API连接测试',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'API连接正常' : `API出错: ${response.status}`,
        data: data
      });
    } catch (error) {
      results.push({
        test: 'API连接测试',
        status: 'error',
        message: `API连接失败: ${error}`
      });
    }

    // 测试2：学号格式验证测试
    const testStudentIds = [
      { id: '1020055014001', expected: true },
      { id: '1020255014002', expected: true },
      { id: '12345', expected: false },
      { id: '1020055014', expected: false }
    ];

    for (const { id, expected } of testStudentIds) {
      const isValid = /^102\d55014\d{2}$/.test(id);
      results.push({
        test: `学号格式验证 - ${id}`,
        status: isValid === expected ? 'success' : 'error',
        message: isValid === expected 
          ? `验证通过 (${isValid ? '有效' : '无效'})`
          : `验证失败 - 期望 ${expected ? '有效' : '无效'}，得到 ${isValid ? '有效' : '无效'}`
      });
    }

    // 测试3：邮箱格式验证测试
    const testEmails = [
      { email: 'test@edu.cn', expected: true },
      { email: 'student@stu.edu.cn', expected: true },
      { email: 'user@gmail.com', expected: false },
      { email: 'invalid-email', expected: false }
    ];

    const allowedDomains = ['@edu.cn', '@stu.edu.cn', '@student.edu.cn', '@mail.edu.cn'];
    for (const { email, expected } of testEmails) {
      const isValid = allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
      results.push({
        test: `教育邮箱验证 - ${email}`,
        status: isValid === expected ? 'success' : 'error',
        message: isValid === expected 
          ? `验证通过 (${isValid ? '有效' : '无效'})`
          : `验证失败 - 期望 ${expected ? '有效' : '无效'}，得到 ${isValid ? '有效' : '无效'}`
      });
    }

    // 测试4：密码强度验证测试
    const testPasswords = [
      { password: 'Admin123', expected: true },
      { password: 'Abc12345', expected: true },
      { password: '12345678', expected: false },
      { password: 'abcdefgh', expected: false },
      { password: 'Admin', expected: false }
    ];

    for (const { password, expected } of testPasswords) {
      const isValid = password.length >= 8 && 
                      /[A-Z]/.test(password) && 
                      /[a-z]/.test(password) && 
                      /\d/.test(password);
      results.push({
        test: `密码强度验证 - ${password}`,
        status: isValid === expected ? 'success' : 'error',
        message: isValid === expected 
          ? `验证通过 (${isValid ? '有效' : '无效'})`
          : `验证失败 - 期望 ${expected ? '有效' : '无效'}，得到 ${isValid ? '有效' : '无效'}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* 实时通知测试 */}
        <div className="mb-8 flex justify-center">
          <RealtimeTest />
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>室友匹配系统 - 功能测试页面</CardTitle>
            <CardDescription>
              验证系统核心功能和验证逻辑的正确性
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>测试包含：</strong>
                  <br />• API连接测试
                  <br />• 学号格式验证测试
                  <br />• 教育邮箱验证测试  
                  <br />• 密码强度验证测试
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={runTests} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? '测试运行中...' : '开始测试'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
              <CardDescription>
                成功: {testResults.filter(r => r.status === 'success').length} / 
                失败: {testResults.filter(r => r.status === 'error').length} / 
                总计: {testResults.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Alert key={index} className={
                    result.status === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }>
                    {result.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <div className="font-medium">{result.test}</div>
                      <div className="text-sm mt-1">{result.message}</div>
                      {result.data && (
                        <div className="text-xs mt-1 text-gray-500">
                          数据: {JSON.stringify(result.data, null, 2)}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>已创建测试用户</CardTitle>
            <CardDescription>可用于登录测试的用户账号</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 bg-gray-100 p-4 rounded-lg font-mono text-sm">
              <div><strong>学号:</strong> 1020055014001</div>
              <div><strong>邮箱:</strong> test@edu.cn</div>
              <div><strong>密码:</strong> Admin123</div>
              <div><strong>状态:</strong> 已验证邮箱</div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-600">
              您可以使用这些信息在 <a href="/sign-in" className="text-blue-600 hover:underline">/sign-in</a> 页面测试登录功能。
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}