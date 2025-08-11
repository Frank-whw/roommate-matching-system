'use client';

import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/contexts/realtime-context';
import { NotificationType } from '@/lib/realtime/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X,
  Heart,
  Users,
  UserPlus,
  Check,
  AlertTriangle
} from 'lucide-react';

interface ToastNotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const ToastIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case NotificationType.NEW_MATCH:
      return <Heart className="w-5 h-5 text-red-500" />;
    case NotificationType.TEAM_JOIN_REQUEST:
      return <UserPlus className="w-5 h-5 text-blue-500" />;
    case NotificationType.TEAM_REQUEST_APPROVED:
      return <Check className="w-5 h-5 text-green-500" />;
    case NotificationType.TEAM_REQUEST_REJECTED:
      return <AlertTriangle className="w-5 h-5 text-orange-500" style={{ fill: 'none', stroke: 'currentColor' }} />;
    case NotificationType.USER_LIKED:
      return <Heart className="w-5 h-5 text-pink-500" />;
    default:
      return <Users className="w-5 h-5 text-gray-500" />;
  }
};

export function ToastNotification({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  const getToastStyle = () => {
    switch (type) {
      case NotificationType.NEW_MATCH:
      case NotificationType.USER_LIKED:
        return 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case NotificationType.TEAM_REQUEST_APPROVED:
        return 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case NotificationType.TEAM_REQUEST_REJECTED:
        return 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case NotificationType.TEAM_JOIN_REQUEST:
        return 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <Card className={`w-80 shadow-lg transition-all duration-300 ${getToastStyle()} ${
      isVisible ? 'animate-in slide-in-from-right-2' : 'animate-out slide-out-to-right-2'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <ToastIcon type={type} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-auto p-0 w-5 h-5 hover:bg-transparent"
          >
            <X className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Toast容器组件
export function ToastContainer() {
  const { state } = useRealtime();
  const [visibleToasts, setVisibleToasts] = useState<string[]>([]);

  // 监听新通知并显示Toast
  useEffect(() => {
    const latestNotification = state.notifications[0];
    if (latestNotification && !latestNotification.read) {
      // 只显示最近5秒内的通知作为Toast
      const timeDiff = Date.now() - latestNotification.createdAt.getTime();
      if (timeDiff < 5000 && !visibleToasts.includes(latestNotification.id)) {
        setVisibleToasts(prev => [...prev, latestNotification.id].slice(-3)); // 最多显示3个Toast
      }
    }
  }, [state.notifications, visibleToasts]);

  const handleRemoveToast = (toastId: string) => {
    setVisibleToasts(prev => prev.filter(id => id !== toastId));
  };

  const toastsToShow = state.notifications.filter(notification => 
    visibleToasts.includes(notification.id)
  );

  if (toastsToShow.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastsToShow.map((notification, index) => (
        <div
          key={notification.id}
          style={{ 
            animationDelay: `${index * 100}ms`,
            transform: `translateY(${index * 4}px)`
          }}
        >
          <ToastNotification
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => handleRemoveToast(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}