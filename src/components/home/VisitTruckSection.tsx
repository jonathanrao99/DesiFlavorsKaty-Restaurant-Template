// VisitTruckSection for Home Page
// Matches About page's Visit Our Food Truck section, with Catering & Events style background
// Author: AI-generated for your Flavors Hub
import { MapPin, Phone, Mail, Clock, ExternalLink, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const XIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const VisitTruckSection = () => {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

  useEffect(() => {
    const timer = setTimeout(() => { setHasAnimated(true); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} className="pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden">
      {/* Decorative elements with parallax */}
      <motion.div 
        className="absolute top-0 left-0 w-24 h-24 bg-your-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ y: scrollYProgress ? scrollYProgress.get() * 20 : 0 }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-48 h-48 bg-your-orange/5 rounded-full translate-x-1/3 translate-y-1/3"
        style={{ y: scrollYProgress ? -scrollYProgress.get() * 20 : 0 }}
      />
      <motion.div 
        className="absolute top-1/4 right-10 w-12 h-12 bg-your-orange/10 rounded-full"
        style={{ y: scrollYProgress ? scrollYProgress.get() * 10 : 0 }}
      />
      <motion.div 
        className="absolute left-10 bottom-20 w-3 h-3 rounded-full bg-your-orange/40"
        animate={hasAnimated ? { y: 0, opacity: 0.6 } : { y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: hasAnimated ? 0 : Infinity, ease: "easeInOut" }}
        viewport={{ once: true }}
      />
      <motion.div 
        className="absolute right-1/3 top-40 w-4 h-4 rounded-full bg-your-orange/30"
        animate={hasAnimated ? { y: 0, opacity: 0.5 } : { y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: hasAnimated ? 0 : Infinity, ease: "easeInOut", delay: 1 }}
        viewport={{ once: true }}
      />
      {/* Decorative background accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-your-orange/10 via-yellow-100/10 to-orange-100/0 blur-2xl opacity-40 z-0 pointer-events-none" />
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-your-black mb-4">
            Visit Our Food Truck
          </h2>
          <div className="h-1 w-20 bg-your-orange mb-6"></div>
          <p className="max-w-3xl text-gray-800 text-lg">
            Experience authentic Indian cuisine in the heart of Katy
          </p>
        </motion.div>
        {/* Centered Map Card with Pin Overlay */}
        <div className="flex justify-center items-center w-full">
          <div className="relative w-full max-w-3xl">
            {/* Location pin overlay - move to top-right */}
            <div className="absolute -top-6 right-6 z-20 bg-white rounded-full shadow p-2 border-2 border-your-orange">
              <MapPin className="w-7 h-7 text-your-orange" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl border border-your-orange/30 overflow-hidden w-full"
            >
              <div className="h-[300px] md:h-[400px] lg:h-[500px] w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d891.9331375493595!2d-95.72059509999999!3d29.7958849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8641210045d45d63%3A0x3a9eebb90dacf13b!2syour%20Flavors%20(Food%20Truck)!5e0!3m2!1sen!2sus!4v1711409649044!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisitTruckSection; 