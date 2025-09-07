'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp } from '@/utils/motion.variants';

const MenuHeader = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const springProgress = useSpring(scrollYProgress, springConfig);

  const scale = useTransform(springProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(springProgress, [0, 1], [1, 0.7]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70svh] flex items-center justify-center overflow-hidden bg-desi-black"
    >
      <motion.div
        style={{ scale, opacity }}
        className="absolute inset-0 z-0 will-change-transform"
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
      >
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="/Food/foodtable.webp"
          alt="Desi Flavors Food Table"
          className="transform-gpu object-cover absolute inset-0 w-full h-full"
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </motion.div>

      <div className="absolute inset-0 z-[1] opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="container relative z-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="w-full text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-4xl md:text-4xl lg:text-7xl font-display font-bold tracking-tight leading-tight">
              <span className="text-white block">Explore Our Menu</span>
            </h1>
          </motion.div>

                    

        </div>
      </div>
    </section>
  );
};

export default MenuHeader;
