'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Settings
} from 'lucide-react';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSendTest = async () => {
    if (!email.trim()) {
      setResult({
        success: false,
        message: '请输入有效的邮箱地址'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.message || (data.success ? '测试邮件发送成功！' : '测试邮件发送失败！')
      });
    } catch (error) {
      setResult({
        success: false,
        message: '发送请求时出错，请检查网络连接'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            邮件服务测试
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            测试系统邮件发送功能是否正常工作
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-500" />
              发送测试邮件
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">测试邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="输入接收测试邮件的邮箱地址..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleSendTest}
              disabled={isLoading || !email.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  发送测试邮件
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-500" />
              配置说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>邮件配置方法：</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>在 .env 文件中配置邮件服务器信息</li>
                    <li>确保提供正确的 MAIL_SERVER、MAIL_USERNAME、MAIL_PASSWORD</li>
                    <li>如使用QQ邮箱，需要使用授权码而非登录密码</li>
                    <li>如使用Gmail，需要启用两步验证并使用应用专用密码</li>
                  </ol>
                  <p className="text-xs text-gray-600 mt-3">
                    💡 提示：如果未配置邮件服务器，系统将使用模拟模式（仅在控制台输出）
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium mb-2">常用邮件服务商配置：</h4>
              <div className="text-sm space-y-1">
                <p><strong>QQ邮箱：</strong> smtp.qq.com:587 (需要授权码)</p>
                <p><strong>163邮箱：</strong> smtp.163.com:25 (需要授权码)</p>
                <p><strong>Gmail：</strong> smtp.gmail.com:587 (需要应用密码)</p>
                <p><strong>Outlook：</strong> smtp.live.com:587</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}