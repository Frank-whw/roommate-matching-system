'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRealtime } from '@/contexts/realtime-context';
import { NotificationType } from '@/lib/realtime/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  BellRing, 
  X,
  Heart,
  Users,
  UserPlus,
  UserX,
  Check,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case NotificationType.NEW_MATCH:
      return <Heart className="w-4 h-4 text-red-500" />;
    case NotificationType.TEAM_JOIN_REQUEST:
      return <UserPlus className="w-4 h-4 text-blue-500" />;
    case NotificationType.TEAM_REQUEST_APPROVED:
      return <Check className="w-4 h-4 text-green-500" />;
    case NotificationType.TEAM_REQUEST_REJECTED:
      return <UserX className="w-4 h-4 text-orange-500" />;
    case NotificationType.USER_LIKED:
      return <Heart className="w-4 h-4 text-pink-500" />;
    case NotificationType.TEAM_MEMBER_LEFT:
    case NotificationType.TEAM_DISBANDED:
      return <Users className="w-4 h-4 text-gray-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export function NotificationCenter() {
  const { state, markAsRead, markAllAsRead, clearNotifications } = useRealtime();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 关闭下拉菜单的点击外部处理
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return '刚刚';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前`;
    } else if (diffInHours < 168) { // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}天前`;
    } else {
      return format(date, 'MM/dd');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 通知按钮 */}
      <Button
        variant="ghost"
        size="sm"
        className="relative h-8 w-8 sm:h-9 sm:w-9 p-1.5 sm:p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {state.unreadCount > 0 ? (
          <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
        
        {state.unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-xs"
          >
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </Badge>
        )}
      </Button>

      {/* 通知下拉面板 */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-96 overflow-hidden shadow-lg z-50">
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">通知中心</CardTitle>
              <div className="flex items-center space-x-2">
                {state.unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-auto py-1 px-2"
                  >
                    全部已读
                  </Button>
                )}
                {state.notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs h-auto py-1 px-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    清空
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {state.notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无新通知</p>
              </div>
            ) : (
              <div className="divide-y">
                {state.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 简化的通知指示器（用于移动端）
export function NotificationBadge() {
  const { state } = useRealtime();
  
  if (state.unreadCount === 0) return null;
  
  return (
    <Badge variant="destructive" className="ml-2">
      {state.unreadCount > 99 ? '99+' : state.unreadCount}
    </Badge>
  );
}