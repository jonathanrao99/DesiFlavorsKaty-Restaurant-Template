'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function PageTransitionWrapper({ children }: { children: ReactNode }) {
  return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
  );
} 