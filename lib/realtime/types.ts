// 实时更新系统的类型定义

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: number;
  data?: any;
  createdAt: Date;
  read?: boolean;
}

export enum NotificationType {
  NEW_MATCH = 'new_match',
  TEAM_JOIN_REQUEST = 'team_join_request',
  TEAM_REQUEST_APPROVED = 'team_request_approved',
  TEAM_REQUEST_REJECTED = 'team_request_rejected',
  TEAM_MEMBER_LEFT = 'team_member_left',
  TEAM_DISBANDED = 'team_disbanded',
  USER_LIKED = 'user_liked',
  SYSTEM_ANNOUNCEMENT = 'system_announcement'
}

export interface RealtimeState {
  notifications: NotificationData[];
  unreadCount: number;
  lastUpdated: Date;
}

export interface RealtimeContextType {
  state: RealtimeState;
  addNotification: (notification: Omit<NotificationData, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  startPolling: () => void;
  stopPolling: () => void;
}

export interface PollingOptions {
  interval?: number; // in milliseconds, default 30000 (30s)
  enabled?: boolean;
}