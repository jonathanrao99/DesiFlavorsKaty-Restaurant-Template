'use client';
import Link from 'next/link';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp } from '@/utils/motion.variants';
import Image from 'next/image';
import MagneticButton from '@/components/MagneticButton';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { useRouter } from 'next/navigation';

// New animation variant for smooth fade/slide
const fadeSlide = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 0.9, y: 0, transition: { duration: 1.5, ease: 'easeInOut' } },
};

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Use spring physics for smooth animation
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const springProgress = useSpring(0, springConfig); // static spring
  
  // Subtle zoom and fade effect
  const scale = 1.12;
  const opacity = 0.95;

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-desi-black"
    >
      {/* Ken Burns Background Animation */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        initial={{ scale: 1, x: 0, y: 0 }}
        animate={{ scale: scale, x: 20, y: -10, opacity: opacity }}
        transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* Subtle pulsing overlay */}
        <div className="absolute inset-0 bg-white/5 animate-pulse-subtle pointer-events-none" />
        <Image
          src="/Truck/truck-3.jpg"
          alt="Desi Flavors Food Truck"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>

      {/* Animated Patterns - Subtle dot pattern */}
      <div className="absolute inset-0 z-[1] opacity-10 pointer-events-none">
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
            variants={fadeSlide}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight">
              <span className="text-white block">Authentic Indian Flavors</span>
              <span className="bg-desi-orange bg-clip-text block mt-2 font-bold">
                On Wheels
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div
            variants={fadeSlide}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mb-8 md:mb-10"
          >
            <p className="text-xl md:text-2xl font-inter text-white leading-relaxed max-w-3xl mx-auto">
              Experience homestyle Indian cuisine with our specialty biryanis and traditional favorites, crafted with authentic recipes.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={fadeSlide}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-8 md:mb-10"
          >
            <MagneticButton className="bg-white/10 backdrop-blur-sm text-green-500 px-5 py-2.5 rounded-full text-sm font-medium border border-white/10 flex items-center gap-2 hover:bg-white/20 transition-colors">
              <Check size={16} />
              100% Halal
            </MagneticButton>
          </motion.div>

          {/* CTA Buttons - Revert to glass style */}
          <motion.div
            variants={fadeSlide}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/menu">
              <MagneticButton
                className="w-full sm:w-auto flex items-center justify-center gap-2 !bg-desi-orange !text-white"
                onClick={() => router.push('/menu')}
              >
                <span>Order Online</span>
                <ChevronRight size={20} className="text-white" />
              </MagneticButton>
            </Link>
            <Link href="/menu">
              <MagneticButton
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/10"
                onClick={() => router.push('/menu')}
              >
                View Menu
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease: 'easeInOut' }}
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
