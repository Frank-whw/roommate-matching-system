// 实时通知的本地存储管理
import { NotificationData, RealtimeState } from './types';

const STORAGE_KEY = 'roommate_notifications';
const MAX_NOTIFICATIONS = 50; // 最多存储50条通知

export class NotificationStorage {
  static getState(): RealtimeState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          notifications: parsed.notifications?.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
          })) || [],
          unreadCount: parsed.unreadCount || 0,
          lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : new Date()
        };
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
    
    return {
      notifications: [],
      unreadCount: 0,
      lastUpdated: new Date()
    };
  }

  static saveState(state: RealtimeState): void {
    try {
      // 限制通知数量，只保留最新的
      const limitedNotifications = state.notifications
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, MAX_NOTIFICATIONS);

      const toSave = {
        ...state,
        notifications: limitedNotifications,
        lastUpdated: new Date()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }

  static addNotification(notification: NotificationData): RealtimeState {
    const currentState = this.getState();
    const newNotifications = [notification, ...currentState.notifications];
    const newState = {
      notifications: newNotifications.slice(0, MAX_NOTIFICATIONS),
      unreadCount: currentState.unreadCount + 1,
      lastUpdated: new Date()
    };
    
    this.saveState(newState);
    return newState;
  }

  static markAsRead(notificationId: string): RealtimeState {
    const currentState = this.getState();
    const updatedNotifications = currentState.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    const unreadCount = updatedNotifications.filter(n => !n.read).length;
    const newState = {
      notifications: updatedNotifications,
      unreadCount: unreadCount,
      lastUpdated: new Date()
    };
    
    this.saveState(newState);
    return newState;
  }

  static markAllAsRead(): RealtimeState {
    const currentState = this.getState();
    const updatedNotifications = currentState.notifications.map(n => ({ ...n, read: true }));
    const newState = {
      notifications: updatedNotifications,
      unreadCount: 0,
      lastUpdated: new Date()
    };
    
    this.saveState(newState);
    return newState;
  }

  static clearAll(): RealtimeState {
    const newState = {
      notifications: [],
      unreadCount: 0,
      lastUpdated: new Date()
    };
    
    this.saveState(newState);
    return newState;
  }
}