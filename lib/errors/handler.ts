// 全局错误处理器

import { ErrorType, AppError, ApiError } from './types';

// HTTP状态码映射到错误类型
const HTTP_STATUS_TO_ERROR_TYPE: Record<number, ErrorType> = {
  400: ErrorType.VALIDATION,
  401: ErrorType.AUTHENTICATION,
  403: ErrorType.FORBIDDEN,
  404: ErrorType.NOT_FOUND,
  409: ErrorType.CONFLICT,
  429: ErrorType.RATE_LIMIT,
  500: ErrorType.SERVER_ERROR,
  502: ErrorType.SERVER_ERROR,
  503: ErrorType.SERVER_ERROR,
  504: ErrorType.SERVER_ERROR,
};

// API响应错误处理
export function handleApiError(response: Response, data?: ApiError): AppError {
  const errorType = HTTP_STATUS_TO_ERROR_TYPE[response.status] || ErrorType.SERVER_ERROR;
  
  // 如果响应中包含具体的错误信息，使用它
  if (data?.error) {
    return new AppError({
      type: data.type || errorType,
      message: data.error,
      field: data.field,
      code: data.code,
      details: data.details,
      retry: [500, 502, 503, 504].includes(response.status)
    });
  }

  // 默认错误消息
  const defaultMessages: Record<number, string> = {
    400: '请求参数错误',
    401: '请先登录',
    403: '权限不足',
    404: '资源不存在',
    409: '数据冲突',
    429: '请求过于频繁',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务暂不可用',
    504: '请求超时'
  };

  return new AppError({
    type: errorType,
    message: defaultMessages[response.status] || '未知错误',
    code: response.status.toString(),
    retry: [500, 502, 503, 504].includes(response.status)
  });
}

// 网络错误处理
export function handleNetworkError(error: Error): AppError {
  return new AppError({
    type: ErrorType.NETWORK,
    message: '网络连接失败',
    details: error.message,
    retry: true
  });
}

// 验证错误处理
export function handleValidationError(field: string, message: string): AppError {
  return new AppError({
    type: ErrorType.VALIDATION,
    message,
    field
  });
}

// 统一的API调用错误处理
export async function handleApiCall<T>(
  apiCall: () => Promise<Response>
): Promise<T> {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      let errorData: ApiError | undefined;
      
      // 尝试解析错误响应
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        }
      } catch (parseError) {
        console.warn('无法解析错误响应:', parseError);
      }
      
      throw handleApiError(response, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    // 网络错误或其他未知错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw handleNetworkError(error);
    }
    
    // 其他错误
    throw new AppError({
      type: ErrorType.SERVER_ERROR,
      message: error instanceof Error ? error.message : '未知错误',
      details: error
    });
  }
}

// 生产环境敏感信息过滤
function sanitizeForProduction(data: any): any {
  if (process.env.NODE_ENV !== 'production') {
    return data;
  }

  if (typeof data === 'string') {
    // 过滤可能的敏感信息模式
    return data
      .replace(/password['":\s]*[^,}\s]*/gi, 'password: [REDACTED]')
      .replace(/token['":\s]*[^,}\s]*/gi, 'token: [REDACTED]')
      .replace(/email['":\s]*[^,}\s]*/gi, 'email: [REDACTED]')
      .replace(/secret['":\s]*[^,}\s]*/gi, 'secret: [REDACTED]');
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('password') || lowerKey.includes('token') || 
          lowerKey.includes('secret') || lowerKey.includes('email')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForProduction(value);
      }
    }
    return sanitized;
  }

  return data;
}

// 日志错误
export function logError(error: AppError, context?: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // 生产环境：只记录基本信息，不包含敏感数据
    console.error(`[${error.type}] ${context || 'Error'}:`, {
      message: error.message,
      type: error.type,
      code: error.code,
      timestamp: error.timestamp,
      retry: error.retry
    });
  } else {
    // 开发环境：记录详细信息
    console.group(`🚨 ${error.type} Error ${context ? `[${context}]` : ''}`);
    console.error('Message:', error.message);
    console.error('Type:', error.type);
    console.error('Field:', error.field);
    console.error('Code:', error.code);
    console.error('Timestamp:', error.timestamp);
    console.error('Retry:', error.retry);
    console.error('Details:', sanitizeForProduction(error.details));
    console.error('Stack:', error.stack);
    console.groupEnd();
  }
  
  // 在生产环境中，这里可以发送错误到监控服务
  if (isProduction) {
    // 发送到错误监控服务 (例如 Sentry)
    // sentryCapture({
    //   message: error.message,
    //   type: error.type,
    //   code: error.code,
    //   timestamp: error.timestamp
    // });
  }
}