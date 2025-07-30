// 错误类型定义

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK = 'NETWORK',
  RATE_LIMIT = 'RATE_LIMIT',
  FORBIDDEN = 'FORBIDDEN'
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  field?: string; // 表单字段名称
  code?: string; // 错误代码
  details?: any; // 详细信息
  timestamp?: Date;
  retry?: boolean; // 是否可重试
}

export interface FormError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// API错误响应接口
export interface ApiError {
  error: string;
  type?: ErrorType;
  field?: string;
  code?: string;
  details?: any;
}

// 客户端错误类
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly field?: string;
  public readonly code?: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly retry: boolean;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'AppError';
    this.type = details.type;
    this.field = details.field;
    this.code = details.code;
    this.details = details.details;
    this.timestamp = details.timestamp || new Date();
    this.retry = details.retry || false;
  }

  // 转换为用户友好的消息
  getUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return '网络连接异常，请检查网络后重试';
      case ErrorType.SERVER_ERROR:
        return '服务器繁忙，请稍后重试';
      case ErrorType.AUTHENTICATION:
        return '登录状态已过期，请重新登录';
      case ErrorType.AUTHORIZATION:
        return '您没有权限执行此操作';
      case ErrorType.NOT_FOUND:
        return '请求的资源不存在';
      case ErrorType.CONFLICT:
        return '数据冲突，请刷新页面后重试';
      case ErrorType.RATE_LIMIT:
        return '操作过于频繁，请稍后重试';
      case ErrorType.FORBIDDEN:
        return '访问被拒绝';
      case ErrorType.VALIDATION:
      default:
        return this.message;
    }
  }
}