'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  delay?: number;
}

export default function LoadingIndicator({ delay = 100 }: LoadingIndicatorProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [pathname, delay]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-primary to-primary/80"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 页面级加载指示器
export function PageLoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" style={{ fill: 'none', stroke: 'currentColor' }} />
        <p className="text-sm text-muted-foreground">页面加载中...</p>
      </div>
    </motion.div>
  );
}

// 组件级加载指示器
export function ComponentLoadingIndicator({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} style={{ fill: 'none', stroke: 'currentColor' }} />
    </div>
  );
}

// 按钮级加载指示器
export function ButtonLoadingIndicator() {
  return <Loader2 className="h-4 w-4 animate-spin mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />;
}