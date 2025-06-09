import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardGridProps {
  children: ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  staggerDelay?: number;
}

const AnimatedCardGrid = ({
  children,
  className = "",
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 8,
  staggerDelay = 0.2
}: AnimatedCardGridProps) => {
  // Create grid columns class based on props
  const gridColsClass = `grid-cols-${columns.sm || 1} md:grid-cols-${columns.md || 2} lg:grid-cols-${columns.lg || 3} ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''}`;
  
  return (
    <motion.div
      className={`grid ${gridColsClass} gap-${gap} ${className}`}
      initial="hidden"
      whileInView="visible"
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } }
      }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCardGrid; 
