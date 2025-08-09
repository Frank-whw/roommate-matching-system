'use client';

// Toast通知系统Hook

import { useState, useCallback, createContext, useContext } from 'react';
import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextValue {
  notifications: ToastNotification[];
  showToast: (notification: Omit<ToastNotification, 'id'>) => string;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

export function useToastNotifications(): ToastContextValue {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const showToast = useCallback((notification: Omit<ToastNotification, 'id'>): string => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const toast: ToastNotification = {
      id,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, toast]);

    // 自动移除（如果不是持久化的）
    if (!toast.persistent && toast.duration && toast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showToast,
    hideToast,
    clearAll
  };
}

// Global toast context
const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const toast = useToastNotifications();

  return React.createElement(
    ToastContext.Provider,
    { value: toast },
    children,
    React.createElement(ToastContainer, {
      notifications: toast.notifications,
      onHide: toast.hideToast
    })
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast容器组件
interface ToastContainerProps {
  notifications: ToastNotification[];
  onHide: (id: string) => void;
}

function ToastContainer({ notifications, onHide }: ToastContainerProps) {
  if (notifications.length === 0) return null;

  return React.createElement(
    'div',
    {
      className: 'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full',
      style: { pointerEvents: 'none' }
    },
    notifications.map((notification) =>
      React.createElement(ToastItem, {
        key: notification.id,
        notification: notification,
        onHide: onHide
      })
    )
  );
}

interface ToastItemProps {
  notification: ToastNotification;
  onHide: (id: string) => void;
}

function ToastItem({ notification, onHide }: ToastItemProps) {
  const { id, type, title, message, action } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div 
      className={`
        relative rounded-lg border p-4 shadow-lg animate-in slide-in-from-top-2 
        ${getBgColor()}
      `}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {message}
          </p>
          
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="text-xs"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onHide(id)}
          className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 进度条（如果有duration） */}
      {notification.duration && notification.duration > 0 && !notification.persistent && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg"
          style={{
            animation: `toast-progress ${notification.duration}ms linear forwards`
          }}
        />
      )}
    </div>
  );
}