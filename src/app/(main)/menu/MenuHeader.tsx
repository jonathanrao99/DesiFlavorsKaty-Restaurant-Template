import { useState, useEffect } from 'react';
import { useScroll, useSpring, useTransform } from 'framer-motion';

const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

const { scrollYProgress } = mounted ? useScroll({ target: containerRef, offset: ['start start', 'end start'] }) : { scrollYProgress: { get: () => 0 } };
const springConfig = { stiffness: 50, damping: 20, mass: 1 };
const springProgress = mounted ? useSpring(scrollYProgress, springConfig) : { get: () => 0 };
const scale = mounted ? useTransform(springProgress, [0, 1], [1, 1.15]) : 1;
const opacity = mounted ? useTransform(springProgress, [0, 1], [1, 0.7]) : 1; 