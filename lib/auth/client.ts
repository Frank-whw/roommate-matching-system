// 客户端认证工具
import { User } from '@/lib/db/schema';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

const fetcher = async (url: string): Promise<User | null> => {
  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store'
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      return null; // 未认证，返回 null 而不是抛出错误
    }
    throw new Error(`认证请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  return data || null;
};

export { fetcher };

// SWR 配置选项
export const authSWRConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 0,
  errorRetryCount: 1,
  shouldRetryOnError: (error: Error) => {
    // 只在网络错误时重试，401 不重试
    return !error.message.includes('401');
  },
  onError: (error: Error) => {
    console.warn('Auth SWR error:', error.message);
  }
};