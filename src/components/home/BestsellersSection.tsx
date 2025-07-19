import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import BestsellerCard from '@/components/BestsellerCard';
import { SpinningText } from '@/components/magicui/spinning-text';
import { fadeInUp } from '@/utils/motion.variants';
import MagneticButton from '@/components/MagneticButton';
import AnimatedCardGrid, { AnimatedCard } from '@/components/AnimatedCardGrid';

const BestsellersSection = () => {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Set hasAnimated to true after the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 1000); // Wait for initial animation to complete
    
    return () => clearTimeout(timer);
  }, []);

  // Sample bestsellers data with itemIds
  const bestsellers = [{
    id: 1, // Chicken Biryani
    title: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with tender chicken, aromatic spices, and herbs.',
    price: '$11.99',
    imageSrc: '/Menu_Images/chicken-dum-biryani.jpg',
    isSpecial: true,
    itemId: 1 // Chicken Dum Biryani
  }, {
    id: 3, // Butter Chicken
    title: 'Butter Chicken',
    description: 'Tender chicken pieces in a creamy, tomato-based curry with a hint of butter.',
    price: '$11.99',
    imageSrc: '/Menu_Images/butter-chicken.jpg',
    itemId: 8 // Butter Chicken
  }, {
    id: 12, // Aloo Samosa
    title: 'Vegetable Samosas',
    description: 'Crispy pastry triangles filled with spiced potatoes, peas, and vegetables.',
    price: '$4.99',
    imageSrc: '/Menu_Images/aloo-samosa.jpeg',
    itemId: 24 // Aloo Samosa
  }];

  return (
    <section 
      ref={sectionRef}
      className="pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden"
    >
      {/* Decorative elements with parallax */}
      <motion.div 
        className="absolute top-0 left-0 w-24 h-24 bg-desi-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ y: scrollYProgress ? scrollYProgress.get() * 20 : 0 }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-48 h-48 bg-desi-orange/5 rounded-full translate-x-1/3 translate-y-1/3"
        style={{ y: scrollYProgress ? -scrollYProgress.get() * 20 : 0 }}
      />
      <motion.div 
        className="absolute top-1/4 left-10 w-12 h-12 bg-desi-orange/10 rounded-full"
        style={{ y: scrollYProgress ? scrollYProgress.get() * 10 : 0 }}
      />
      
      <motion.div 
        className="absolute left-10 bottom-20 w-3 h-3 rounded-full bg-desi-orange/40"
        animate={hasAnimated ? { 
          y: 0,
          opacity: 0.6
        } : { 
          y: [0, -15, 0],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 3,
          repeat: hasAnimated ? 0 : Infinity,
          ease: "easeInOut"
        }}
        viewport={{ once: true }}
      ></motion.div>
      
      <motion.div 
        className="absolute right-1/3 top-40 w-4 h-4 rounded-full bg-desi-orange/30"
        animate={hasAnimated ? { 
          y: 0,
          opacity: 0.5
        } : { 
          y: [0, -20, 0],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: hasAnimated ? 0 : Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        viewport={{ once: true }}
      ></motion.div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col items-center h-full">
          {/* Title with enhanced animation */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-display leading-tight">
              <motion.span
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
                className="block mb-2"
              >
                Our Bestsellers
              </motion.span>
            </h2>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              transition={{ delay: 0.7, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-4 leading-relaxed"
            >
              Try our crowd favorites, featuring our signature biryanis and flavorful curries 
              that have made us a local favorite.
            </motion.p>
          </motion.div>

          {/* Bestseller Cards Grid */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mt-8 md:mt-12"
          >
            <AnimatedCardGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={8} staggerDelay={0.15}>
              {bestsellers.map((item, index) => (
                <AnimatedCard key={index}>
                  <motion.div
                    whileHover={{ scale: 1.04, boxShadow: '0 4px 32px #ffb34733' }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 bg-white">
                      <div className="p-0">
                        <div className="relative">
                          <SpinningText className="text-desi-orange bg-transparent text-[0.6rem]">
                            bestseller • bestseller • bestseller •
                          </SpinningText>
                          <BestsellerCard {...item} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatedCard>
              ))}
            </AnimatedCardGrid>
          </motion.div>

          {/* View Menu Button */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-10 md:mt-12 text-center"
          >
            <Link href="/menu">
              <MagneticButton className="inline-flex items-center text-desi-orange hover:text-white/80 font-medium transition-colors group transition-transform duration-300 hover:scale-105">
                <span className="border-b border-desi-orange/30 group-hover:border-desi-orange/80 transition-colors pb-1">View Full Menu</span>
                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
              </MagneticButton>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BestsellersSection; 
