'use client';

import { motion } from 'framer-motion';
import Breadcrumb from '@/components/navigation/breadcrumb';

interface PageWrapperProps {
  children: React.ReactNode;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  className?: string;
  withAnimation?: boolean;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

export default function PageWrapper({ 
  children, 
  breadcrumbItems, 
  className = '',
  withAnimation = true 
}: PageWrapperProps) {
  const content = (
    <div className={className}>
      {breadcrumbItems && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Breadcrumb items={breadcrumbItems} className="mb-4" />
        </motion.div>
      )}
      {children}
    </div>
  );

  if (!withAnimation) {
    return content;
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
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