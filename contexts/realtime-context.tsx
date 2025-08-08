'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
import { NotificationData, NotificationType, RealtimeState, RealtimeContextType, PollingOptions } from '@/lib/realtime/types';
import { NotificationStorage } from '@/lib/realtime/storage';

// Reducer for managing realtime state
type RealtimeAction =
  | { type: 'LOAD_STATE'; payload: RealtimeState }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationData }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'UPDATE_UNREAD_COUNT'; payload: number };

function realtimeReducer(state: RealtimeState, action: RealtimeAction): RealtimeState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: state.unreadCount + 1,
        lastUpdated: new Date()
      };
    case 'MARK_AS_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: unreadCount,
        lastUpdated: new Date()
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
        lastUpdated: new Date()
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        notifications: [],
        unreadCount: 0,
        lastUpdated: new Date()
      };
    case 'UPDATE_UNREAD_COUNT':
      return {
        ...state,
        unreadCount: action.payload
      };
    default:
      return state;
  }
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ 
  children, 
  options = { interval: 30000, enabled: true }
}: { 
  children: React.ReactNode;
  options?: PollingOptions;
}) {
  const [state, dispatch] = useReducer(realtimeReducer, {
    notifications: [],
    unreadCount: 0,
    lastUpdated: new Date()
  });

  const pollingRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isPollingRef = useRef(false);

  // Load initial state from localStorage
  useEffect(() => {
    const savedState = NotificationStorage.getState();
    dispatch({ type: 'LOAD_STATE', payload: savedState });
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    NotificationStorage.saveState(state);
  }, [state]);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Add notification
  const addNotification = useCallback((notification: Omit<NotificationData, 'id' | 'createdAt'>) => {
    const newNotification: NotificationData = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
      read: false
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    
    // Show browser notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.type
      });
    }
  }, [generateId]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: notificationId });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  // Polling function to fetch updates
  const fetchUpdates = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // 获取当前用户信息
      const userResponse = await fetch('/api/user');
      if (!userResponse.ok) return;
      
      const userData = await userResponse.json();
      if (!userData?.users?.id) return;

      const userId = userData.users.id;
      const lastCheck = state.lastUpdated.toISOString();
      
      // 检查是否有新的匹配
      const matchesResponse = await fetch(`/api/realtime/check-updates?userId=${userId}&since=${lastCheck}`);
      if (matchesResponse.ok) {
        const updates = await matchesResponse.json();
        
        // 添加新的通知
        if (updates.newMatches?.length > 0) {
          updates.newMatches.forEach((match: any) => {
            addNotification({
              type: NotificationType.NEW_MATCH,
              title: '🎉 新匹配！',
              message: `你与 ${match.matchedUser?.name || '一位用户'} 互相邀请了！`,
              userId: userId,
              data: { matchId: match.id, matchedUserId: match.matchedUser?.id }
            });
          });
        }
        
        // 添加队伍相关通知
        if (updates.teamNotifications?.length > 0) {
          updates.teamNotifications.forEach((notification: any) => {
            addNotification({
              type: notification.type,
              title: notification.title,
              message: notification.message,
              userId: userId,
              data: notification.data
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching realtime updates:', error);
    }
  }, [state.lastUpdated, addNotification]);

  // Start polling
  const startPolling = useCallback(() => {
    if (!options.enabled || isPollingRef.current) return;
    
    isPollingRef.current = true;
    
    const poll = () => {
      fetchUpdates();
      pollingRef.current = setTimeout(poll, options.interval || 30000);
    };
    
    // Initial fetch
    fetchUpdates();
    
    // Set up polling
    pollingRef.current = setTimeout(poll, options.interval || 30000);
  }, [options.enabled, options.interval, fetchUpdates]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = undefined;
    }
    isPollingRef.current = false;
  }, []);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Auto-start polling when component mounts
  useEffect(() => {
    if (options.enabled) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [options.enabled, startPolling, stopPolling]);

  // Handle visibility change to pause/resume polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (options.enabled) {
        startPolling();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [options.enabled, startPolling, stopPolling]);

  const value: RealtimeContextType = {
    state,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    startPolling,
    stopPolling
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}