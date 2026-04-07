import { motion } from 'framer-motion';
import Script from 'next/script';

import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

const CustomerReviewsSection = () => {
  const handleReviewSubmit = (review) => {
    logAnalyticsEvent('review_submitted', review);
    if (typeof window !== 'undefined') {
      (window as any).gtag && (window as any).gtag('event', 'review_submitted', review);
      (window as any).umami && (window as any).umami('review_submitted', review);
    }
    // ...existing logic...
  };

  return (
    <section className="py-16 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden">


      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-your-black">
            What Our Customers Say
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Don't just take our word for it - hear what our satisfied customers have to say about their <br /> <span className="font-samarkan font-bold text-2xl text-your-orange">your</span> <span className="font-semibold text-your-black">brand</span> experience.
          </p>
        </motion.div>
        
        {/* Elfsight Google Reviews Widget */}
        <Script src="https://static.elfsight.com/platform/platform.js" strategy="afterInteractive" />
        <div className="elfsight-app-f5ca9078-1034-483c-a99e-cb120f6b4eae w-full min-h-[500px]" data-elfsight-app-lazy></div>
      </div>
    </section>
  );
};

export default CustomerReviewsSection;
