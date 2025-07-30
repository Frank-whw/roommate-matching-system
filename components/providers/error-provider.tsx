'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface ErrorProviderProps {
  children: React.ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 这里可以添加错误报告逻辑
    console.error('Global error caught:', error, errorInfo);
    
    // 在开发环境中显示更多信息
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // 在生产环境中可以发送错误到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 例如发送到Sentry、LogRocket等
      // sentryCapture(error, { extra: errorInfo });
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}