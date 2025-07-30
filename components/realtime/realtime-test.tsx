'use client';

import { useState } from 'react';
import { useRealtime } from '@/contexts/realtime-context';
import { NotificationType } from '@/lib/realtime/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, TestTube } from 'lucide-react';

export function RealtimeTest() {
  const { addNotification, state } = useRealtime();
  const [isTestingPollling, setIsTestingPolling] = useState(false);

  const testNotifications = [
    {
      type: NotificationType.NEW_MATCH,
      title: '🎉 新匹配！',
      message: '你与张三互相喜欢了！',
      userId: 1,
      data: { matchId: 'test-123' }
    },
    {
      type: NotificationType.TEAM_JOIN_REQUEST,
      title: '🔔 新的入队申请',
      message: '李四申请加入您的队伍"技术宅"',
      userId: 1,
      data: { teamId: 'test-456', applicantName: '李四' }
    },
    {
      type: NotificationType.TEAM_REQUEST_APPROVED,
      title: '✅ 申请已通过',
      message: '您的入队申请已被批准！欢迎加入队伍"学霸联盟"',
      userId: 1,
      data: { teamName: '学霸联盟' }
    },
    {
      type: NotificationType.USER_LIKED,
      title: '💖 有人喜欢你',
      message: '王五对你点了赞！',
      userId: 1,
      data: { fromUserId: 'test-789' }
    }
  ];

  const handleTestNotification = () => {
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    addNotification(randomNotification);
  };

  const handleTestPolling = async () => {
    setIsTestingPolling(true);
    try {
      const response = await fetch('/api/realtime/check-updates?userId=1&since=2024-01-01T00:00:00.000Z');
      const data = await response.json();
      console.log('Polling test response:', data);
      
      if (data.newMatches?.length > 0) {
        addNotification({
          type: NotificationType.NEW_MATCH,
          title: '🎉 测试轮询：发现新匹配',
          message: `发现 ${data.newMatches.length} 个新匹配`,
          userId: 1,
          data: { matches: data.newMatches }
        });
      } else {
        addNotification({
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title: '📡 轮询测试完成',
          message: '轮询API正常工作，当前没有新更新',
          userId: 1,
          data: { testTime: new Date().toISOString() }
        });
      }
    } catch (error) {
      console.error('Polling test failed:', error);
      addNotification({
        type: NotificationType.SYSTEM_ANNOUNCEMENT,
        title: '❌ 轮询测试失败',
        message: '无法连接到实时更新API',
        userId: 1,
        data: { error: error }
      });
    } finally {
      setIsTestingPolling(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <TestTube className="w-4 h-4 mr-2" />
          实时通知测试
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>未读通知：{state.unreadCount}</span>
          <span>总通知：{state.notifications.length}</span>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={handleTestNotification} 
            size="sm" 
            className="w-full"
            variant="outline"
          >
            <Bell className="w-3 h-3 mr-2" />
            触发测试通知
          </Button>
          
          <Button 
            onClick={handleTestPolling} 
            size="sm" 
            className="w-full"
            variant="outline"
            disabled={isTestingPolling}
          >
            <TestTube className="w-3 h-3 mr-2" />
            {isTestingPolling ? '测试中...' : '测试轮询API'}
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>上次更新: {state.lastUpdated.toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}