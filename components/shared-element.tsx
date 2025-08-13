'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SharedElementProps {
  children: ReactNode;
  layoutId: string;
  className?: string;
}

export function SharedElement({ children, layoutId, className }: SharedElementProps) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
        duration: 0.2
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Avatar shared element component
export function SharedAvatar({ layoutId, children, className }: SharedElementProps) {
  return (
    <motion.div
      layoutId={layoutId}
      transition={{
        type: "spring",
        stiffness: 600,
        damping: 40,
        duration: 0.15
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}