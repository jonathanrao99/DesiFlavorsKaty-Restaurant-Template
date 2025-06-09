'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Define supported animation types
export type MotionDivType = 'fadeIn' | 'slideUp' | 'slideIn';

export interface MotionDivProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  type?: MotionDivType;
}

const animationVariants: Record<MotionDivType, { initial: any; animate: any; transition: { duration: number } }> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.6 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6 },
  },
};

export const MotionDiv: React.FC<MotionDivProps> = ({
  children,
  className = '',
  delay = 0,
  once = true,
  type = 'fadeIn',
}) => (
  <motion.div
    initial={animationVariants[type].initial}
    whileInView={animationVariants[type].animate}
    transition={{ ...animationVariants[type].transition, delay }}
    viewport={{ once }}
    className={className}
  >
    {children}
  </motion.div>
); 