'use client';
import Link from 'next/link';
import { Check, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp } from '@/utils/motion.variants';
import MagneticButton from '@/components/MagneticButton';

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use scroll for zoom and fade effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Use spring physics for smooth animation
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const springProgress = useSpring(scrollYProgress, springConfig);

  // Subtle zoom and fade effect
  const scale = useTransform(springProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(springProgress, [0, 1], [1, 0.7]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-desi-black"
    >
      {/* Background Image with Zoom Effect */}
      <motion.div
        style={{ scale, opacity }}
        className="absolute inset-0 z-0 will-change-transform"
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
      >
        {/* Single overlay with further reduced opacity */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="/Truck/truck-3.jpg"
          alt="Desi Flavors Food Truck"
          className="h-full w-full object-cover transform-gpu"
        />
      </motion.div>

      {/* Animated Patterns - Subtle dot pattern similar to Chef Kiran */}
      <div className="absolute inset-0 z-[1] opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>
      
      {/* Main Content */}
      <div className="container relative z-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Title */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-tight">
              <span className="text-white block">Authentic Indian Flavors</span>
              <span className="bg-desi-orange text-transparent bg-clip-text block mt-2">
                On Wheels
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mb-8 md:mb-10"
          >
            <p className="text-lg md:text-xl text-white leading-relaxed max-w-2xl mx-auto">
              Experience homestyle Indian cuisine with our specialty biryanis
              <br className="hidden md:block" />
              and traditional favorites, crafted with authentic recipes.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-8 md:mb-10"
          >
            <span className="bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2 hover:bg-white/20 transition-colors">
              <span className="text-desi-orange"><Check size={16} /></span>
              100% Halal
            </span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/menu">
              <MagneticButton className="w-full sm:w-auto flex items-center gap-2">
                Order Online
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>→</motion.span>
              </MagneticButton>
            </Link>
            <Link href="/menu">
              <MagneticButton className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/10">
                View Menu
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.7, duration: 0.7 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-white/50 cursor-pointer hover:text-white/80 transition-colors">
          <ChevronDown size={28} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
