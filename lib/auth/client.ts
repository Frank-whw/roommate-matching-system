// 客户端认证工具
import { User } from '@/lib/db/schema';
import type { SWRConfiguration } from 'swr';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store'
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // 对于401错误，抛出特殊错误而不是返回null
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(`认证请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data) {
    throw new Error('UNAUTHORIZED');
  }
  return data;
};

export { fetcher };

// SWR 配置选项
export const authSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
  errorRetryCount: 0,
  shouldRetryOnError: false,
  onError: (error: Error) => {
    // 静默处理认证错误，不在控制台显示
    if (error.message !== 'UNAUTHORIZED') {
      console.warn('Auth SWR error:', error.message);
    }
  }
};