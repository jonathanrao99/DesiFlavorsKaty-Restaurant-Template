import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Script from 'next/script';

const reviews = [
  {
    id: 1,
    rating: 5,
    text: "The chicken biryani from Desi Flavors is hands down the best I've had in Houston. Authentic flavors that remind me of home!",
    author: "Sarah M.",
    location: "Houston, TX"
  },
  {
    id: 2,
    rating: 5,
    text: "I love that their food is always fresh and flavorful. The butter chicken is creamy perfection! My weekly comfort food.",
    author: "David L.",
    location: "Katy, TX"
  },
  {
    id: 3,
    rating: 5,
    text: "The vegetable samosas are crispy on the outside and perfectly spiced on the inside. Great friendly service too!",
    author: "Priya K.",
    location: "Sugar Land, TX"
  },
  {
    id: 4,
    rating: 5,
    text: "Their biryani is simply outstanding! The flavors are authentic and the portions are generous. A must-try!",
    author: "Michael R.",
    location: "Richmond, TX"
  },
  {
    id: 5,
    rating: 5,
    text: "The best Indian food truck in the area! Their butter chicken and naan are absolutely delicious.",
    author: "Jennifer T.",
    location: "Cypress, TX"
  }
];

const CustomerReviewsSection = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, totalPages]);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  // Get the current set of reviews to display
  const currentReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  return (
    <section className="py-16 bg-gradient-to-b from-desi-cream via-white/80 to-white relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-desi-orange/5 via-gray-50/50 to-transparent"
      />

      <div className="container mx-auto px-4 md:px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-desi-black">
            What Our Customers Say
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Don't just take our word for it - hear what our satisfied customers have to say about their Desi Flavors experience.
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
