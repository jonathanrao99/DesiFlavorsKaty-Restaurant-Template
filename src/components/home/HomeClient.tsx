"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import DesiExperienceSection from '@/components/home/DesiExperienceSection';
import dynamic from 'next/dynamic';
import CustomerReviewsSection from '@/components/home/CustomerReviewsSection';
import ConnectSection from '@/components/home/ConnectSection';

const BestsellersSection = dynamic(() => import('@/components/home/BestsellersSection'), { loading: () => <div style={{height: 400}} /> });
const QualityCommitmentSection = dynamic(() => import('@/components/home/QualityCommitmentSection'), { loading: () => <div style={{height: 400}} /> });

export default function HomeClient() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isScrolled ? 1 : 0,
          y: isScrolled ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-desi-orange text-white p-3 rounded-full shadow-lg hover:bg-desi-orange/90 transition-colors z-50"
        aria-label="Back to top"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
      </motion.button>
      <HeroSection />
      <DesiExperienceSection />
      <BestsellersSection />
      <QualityCommitmentSection />
      <CustomerReviewsSection />
      <ConnectSection />
    </main>
  );
} 