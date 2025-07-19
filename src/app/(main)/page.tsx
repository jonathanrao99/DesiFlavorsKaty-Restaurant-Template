'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import BestsellersSection from '@/components/home/BestsellersSection';
import HomeFoodCarouselSection from '@/components/home/HomeFoodCarouselSection';

const QualityCommitmentSection = dynamic(() => import('@/components/home/QualityCommitmentSection'));
const CustomerReviewsSection = dynamic(() => import('@/components/home/CustomerReviewsSection'));
const ConnectSection = dynamic(() => import('@/components/home/ConnectSection'));
const VisitTruckSection = dynamic(() => import('@/components/home/VisitTruckSection'));

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Reset scroll position and handle scroll events
  useEffect(() => {
    // If there's no hash in URL, scroll to top on mount
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 50);
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <main className="min-h-screen relative" style={{ position: 'relative' }}>
      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isScrolled ? 1 : 0,
          y: isScrolled ? 0 : 20
        }}
        transition={{ duration: 0.3 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-desi-orange text-white p-3 rounded-full shadow-lg 
          hover:bg-desi-orange/90 transition-colors z-50"
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

      {/* Ensure all top-level sections have relative positioning for scroll/animation */}
      <div className="relative" style={{ position: 'relative' }}>
        <HeroSection />
        <HomeFoodCarouselSection />
        <BestsellersSection />
        <QualityCommitmentSection />
        <CustomerReviewsSection />
        <VisitTruckSection />
        <ConnectSection />
      </div>
    </main>
  );
};

export default Index; 