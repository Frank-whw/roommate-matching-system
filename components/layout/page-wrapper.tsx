'use client';

import { motion } from 'framer-motion';
import Breadcrumb from '@/components/navigation/breadcrumb';

interface PageWrapperProps {
  children: React.ReactNode;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  className?: string;
  withAnimation?: boolean;
}

export default function PageWrapper({ 
  children, 
  breadcrumbItems, 
  className = '',
  withAnimation = true 
}: PageWrapperProps) {
  const content = (
    <div className={className}>
      {breadcrumbItems && (
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
      )}
      {children}
    </div>
  );

  if (!withAnimation) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {content}
    </motion.div>
  );
}

// 预定义的页面包装组件
export function FadePageWrapper({ children, breadcrumbItems, className }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {breadcrumbItems && (
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
      )}
      {children}
    </motion.div>
  );
}

export function SlidePageWrapper({ children, breadcrumbItems, className }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      className={className}
    >
      {breadcrumbItems && (
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
      )}
      {children}
    </motion.div>
  );
}