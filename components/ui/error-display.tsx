'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';
import { AppError, ErrorType } from '@/lib/errors/types';

interface ErrorDisplayProps {
  error: AppError | string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({ 
  error, 
  onDismiss, 
  onRetry, 
  className = '',
  showDetails = false
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorObj = typeof error === 'string' 
    ? new AppError({ type: ErrorType.VALIDATION, message: error })
    : error;

  const getIcon = () => {
    switch (errorObj.type) {
      case ErrorType.SERVER_ERROR:
      case ErrorType.NETWORK:
        return <AlertTriangle className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
      case ErrorType.FORBIDDEN:
        return <AlertCircle className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />;
      default:
        return <Info className="w-4 h-4" style={{ fill: 'none', stroke: 'currentColor' }} />;
    }
  };

  const getVariant = (): 'default' | 'destructive' => {
    switch (errorObj.type) {
      case ErrorType.SERVER_ERROR:
      case ErrorType.NETWORK:
      case ErrorType.AUTHENTICATION:
      case ErrorType.FORBIDDEN:
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <div className="flex-1">
        <AlertDescription>
          {errorObj.getUserMessage()}
          
          {showDetails && errorObj.details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm opacity-75">
                技术详情
              </summary>
              <pre className="mt-1 text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-auto">
                {JSON.stringify(errorObj.details, null, 2)}
              </pre>
            </details>
          )}
        </AlertDescription>
      </div>
      
      <div className="flex items-center gap-2 ml-2">
        {errorObj.retry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" style={{ fill: 'none', stroke: 'currentColor' }} />
            重试
          </Button>
        )}
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-xs p-1 h-6 w-6"
          >
            <X className="w-3 h-3" style={{ fill: 'none', stroke: 'currentColor' }} />
          </Button>
        )}
      </div>
    </Alert>
  );
}

// 表单字段错误显示
interface FieldErrorProps {
  error?: string | null;
  className?: string;
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={`text-sm text-red-600 dark:text-red-400 mt-1 ${className}`}>
      {error}
    </div>
  );
}

// 多个错误的列表显示
interface ErrorListProps {
  errors: (AppError | string)[];
  onDismiss?: (index: number) => void;
  onRetry?: (index: number) => void;
  className?: string;
}

export function ErrorList({ 
  errors, 
  onDismiss, 
  onRetry, 
  className = '' 
}: ErrorListProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <ErrorDisplay
          key={index}
          error={error}
          onDismiss={onDismiss ? () => onDismiss(index) : undefined}
          onRetry={onRetry ? () => onRetry(index) : undefined}
        />
      ))}
    </div>
  );
}

// 页面级别的错误显示
interface PageErrorProps {
  error: AppError | string;
  onRetry?: () => void;
  onGoBack?: () => void;
  title?: string;
  description?: string;
}

export function PageError({ 
  error, 
  onRetry, 
  onGoBack, 
  title = '出现错误',
  description 
}: PageErrorProps) {
  const errorObj = typeof error === 'string' 
    ? new AppError({ type: ErrorType.SERVER_ERROR, message: error })
    : error;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" style={{ fill: 'none', stroke: 'currentColor' }} />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {description || errorObj.getUserMessage()}
        </p>
        
        <div className="flex gap-3 justify-center">
          {errorObj.retry && onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
              重试
            </Button>
          )}
          
          {onGoBack && (
            <Button variant="outline" onClick={onGoBack}>
              返回
            </Button>
          )}
          
          {!onGoBack && (
            <Button variant="outline" onClick={() => window.history.back()}>
              返回
            </Button>
          )}
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              开发模式 - 错误详情
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto text-left">
              {errorObj.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}