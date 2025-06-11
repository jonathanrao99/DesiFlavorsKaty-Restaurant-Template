'use client';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Users, Utensils } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScrollToTopOnNavClick } from '@/hooks/useScrollToTopOnNavClick';
import { fadeInUp } from '@/utils/motion.variants';
import MagneticButton from '@/components/MagneticButton';
import AnimatedCardGrid, { AnimatedCard } from '@/components/AnimatedCardGrid';

const Catering = () => {
  const router = useRouter();
  useScrollToTopOnNavClick();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleQuoteClick = () => {
    router.push('/');
    // Use a longer timeout to ensure the page has fully loaded and rendered
    setTimeout(() => {
      const connectSection = document.getElementById('connect');
      if (connectSection) {
        connectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // If the element isn't found immediately, try again after a longer delay
        setTimeout(() => {
          const retryConnectSection = document.getElementById('connect');
          if (retryConnectSection) {
            retryConnectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-16 bg-hero-pattern bg-cover bg-center py-20"
        >
          <h1 className="text-5xl font-display font-bold text-desi-orange mt-12 mb-4">
            Catering Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let us bring the authentic flavors of Indian cuisine to your special events and gatherings.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <AnimatedCardGrid columns={{ sm: 1, md: 2, lg: 3 }} gap={8} staggerDelay={0.2}>
            <AnimatedCard className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Users className="h-12 w-12 text-desi-orange mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">Customizable Menus</h3>
              <p className="text-gray-600">
                We offer flexible menu options that can be tailored to your guest count and preferences.
              </p>
            </AnimatedCard>

            <AnimatedCard className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Utensils className="h-12 w-12 text-desi-orange mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">Fresh & Authentic</h3>
              <p className="text-gray-600">
                All dishes are prepared fresh on-site using authentic ingredients and traditional recipes.
              </p>
            </AnimatedCard>

            <AnimatedCard className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <Clock className="h-12 w-12 text-desi-orange mb-4" />
              <h3 className="text-xl font-display font-semibold mb-2">Professional Service</h3>
              <p className="text-gray-600">
                Our experienced team ensures smooth service and exceptional presentation at your event.
              </p>
            </AnimatedCard>
          </AnimatedCardGrid>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-desi-black mb-6 text-center">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4">
              <Phone className="h-6 w-6 text-desi-orange" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-gray-600">
                  <a href="https://wa.me/13468244212" target="_blank" rel="noopener noreferrer" className="hover:text-desi-orange transition-colors">
                    +1 (346) 824-4212
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="h-6 w-6 text-desi-orange" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">
                  <a href="mailto:info@desiflavorskaty.com" className="hover:text-desi-orange transition-colors">
                    info@desiflavorskaty.com
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="h-6 w-6 text-desi-orange" />
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-gray-600">
                  <a 
                    href="https://maps.app.goo.gl/JURVBywvbtw7Qgja7" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-desi-orange transition-colors"
                  >
                    1989 North Fry Rd, Katy, TX 77494
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center bg-cta-pattern bg-cover bg-center py-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-desi-black mb-4">
            Ready to Plan Your Event?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Contact us today to discuss your catering needs and get a custom quote.
          </p>
          <MagneticButton onClick={handleQuoteClick}>
            Request a Quote
          </MagneticButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Catering; 
