// 统一的API调用Hook

import { useState, useCallback } from 'react';
import { AppError } from '@/lib/errors/types';
import { handleApiCall, logError } from '@/lib/errors/handler';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: AppError) => void;
  logErrors?: boolean;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const { onSuccess, onError, logErrors = true } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    apiCall: () => Promise<Response>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await handleApiCall<T>(apiCall);
      
      setState({
        data,
        loading: false,
        error: null
      });

      onSuccess?.(data);
      return data;
    } catch (error) {
      const appError = error as AppError;
      
      setState({
        data: null,
        loading: false,
        error: appError
      });

      if (logErrors) {
        logError(appError, 'useApi');
      }

      onError?.(appError);
      return null;
    }
  }, [onSuccess, onError, logErrors]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  const retry = useCallback((apiCall?: () => Promise<Response>) => {
    if (apiCall) {
      return execute(apiCall);
    }
    // 如果没有提供apiCall，只清除错误状态
    setState(prev => ({ ...prev, error: null }));
    return Promise.resolve(null);
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
    isSuccess: !state.loading && !state.error && state.data !== null,
    isError: !state.loading && state.error !== null
  };
}

// 专门用于表单提交的Hook
export function useFormSubmit<TData = any, TResult = any>(
  options: UseApiOptions = {}
) {
  const api = useApi<TResult>(options);

  const submit = useCallback(async (
    endpoint: string,
    data?: TData,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
  ): Promise<TResult | null> => {
    return api.execute(() =>
      fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      })
    );
  }, [api]);

  return {
    ...api,
    submit
  };
}

// 专门用于数据获取的Hook
export function useFetch<T = any>(
  url?: string,
  options: UseApiOptions & { autoFetch?: boolean } = {}
) {
  const { autoFetch = false, ...apiOptions } = options;
  const api = useApi<T>(apiOptions);

  const fetch = useCallback(async (
    fetchUrl?: string,
    params?: Record<string, string | number | boolean>
  ): Promise<T | null> => {
    const targetUrl = fetchUrl || url;
    if (!targetUrl) return null;

    let finalUrl = targetUrl;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    return api.execute(() => window.fetch(finalUrl));
  }, [api, url]);

  // 自动获取数据
  React.useEffect(() => {
    if (autoFetch && url) {
      fetch();
    }
  }, [autoFetch, url, fetch]);

  return {
    ...api,
    fetch,
    refetch: () => fetch(url)
  };
}

// 专门用于删除操作的Hook
export function useDelete(options: UseApiOptions = {}) {
  const api = useApi(options);

  const deleteResource = useCallback(async (
    endpoint: string
  ): Promise<any> => {
    return api.execute(() =>
      fetch(endpoint, {
        method: 'DELETE'
      })
    );
  }, [api]);

  return {
    ...api,
    delete: deleteResource
  };
}

// 批量操作Hook
export function useBatchApi<T = any>(options: UseApiOptions = {}) {
  const [states, setStates] = useState<Record<string, UseApiState<T>>>({});

  const execute = useCallback(async (
    key: string,
    apiCall: () => Promise<Response>
  ): Promise<T | null> => {
    setStates(prev => ({
      ...prev,
      [key]: { ...prev[key], loading: true, error: null }
    }));

    try {
      const data = await handleApiCall<T>(apiCall);
      
      setStates(prev => ({
        ...prev,
        [key]: { data, loading: false, error: null }
      }));

      options.onSuccess?.(data);
      return data;
    } catch (error) {
      const appError = error as AppError;
      
      setStates(prev => ({
        ...prev,
        [key]: { data: null, loading: false, error: appError }
      }));

      if (options.logErrors !== false) {
        logError(appError, `useBatchApi[${key}]`);
      }

      options.onError?.(appError);
      return null;
    }
  }, [options]);

  const getState = useCallback((key: string): UseApiState<T> => {
    return states[key] || { data: null, loading: false, error: null };
  }, [states]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: { data: null, loading: false, error: null }
      }));
    } else {
      setStates({});
    }
  }, []);

  return {
    states,
    execute,
    getState,
    reset,
    isLoading: (key: string) => getState(key).loading,
    hasError: (key: string) => getState(key).error !== null,
    getData: (key: string) => getState(key).data
  };
}