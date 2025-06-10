'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { fadeInUp } from '@/utils/motion.variants';
import Image from 'next/image';

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
      className="relative min-h-[60svh] flex items-center justify-center overflow-hidden bg-desi-black"
    >
      <motion.div
        style={{ scale, opacity }}
        className="absolute inset-0 z-0 will-change-transform"
        transition={{ type: 'spring', stiffness: 100, damping: 30 }}
      >
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <Image
          src="/biryani.png"
          alt="Desi Flavors Biryani"
          fill
          className="transform-gpu object-cover"
          priority
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
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-4xl md:text-4xl lg:text-7xl font-against font-bold tracking-tight leading-tight">
              <span className="text-white block">Explore Our Menu</span>
            </h1>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="text-lg md:text-xl text-white leading-relaxed max-w-2xl mx-auto mb-4 font-source-pro"
          >
            Our menu celebrates traditional desi flavours with the finest ingredients crafted into culinary masterpieces. From starters to desserts, each dish is an exquisite experience that invites you on a journey.
          </motion.p>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="text-lg md:text-xl text-white leading-relaxed max-w-2xl mx-auto mb-8 font-source-pro"
          >
            Find us on your favorite delivery platforms:
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 1.4 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Link href="https://www.order.store/store/desi-flavors-katy-1989-fry-road/drrAdlMVTTin4O0Bdvzo2g" target="_blank" rel="noopener noreferrer" className="transform transition-transform duration-300 hover:scale-105">
              <Image src="/ubereats.png" alt="Uber Eats" width={140} height={40} className="object-contain" />
            </Link>
            <Link href="http://menus.fyi/10883320" target="_blank" rel="noopener noreferrer" className="transform transition-transform duration-300 hover:scale-105">
              <Image src="/Grubhub.webp" alt="Grubhub" width={140} height={40} className="object-contain" />
            </Link>
            <Link href="https://order.online/business/desi-flavors-katy-14145277" target="_blank" rel="noopener noreferrer" className="transform transition-transform duration-300 hover:scale-105">
              <Image src="/Doordash.webp" alt="DoorDash" width={140} height={40} className="object-contain" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MenuHeader;
