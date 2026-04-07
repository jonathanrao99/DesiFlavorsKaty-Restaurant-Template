'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { fadeInUp } from '@/utils/motion.variants';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { Phone, Mail, MapPin } from 'lucide-react';
import { siteConfig } from '@/config/site';

const Catering = () => {
  const router = useRouter();

  const handleQuoteClick = () => {
    router.push('/#connect');
  };

  // Carousel media and state
  const media = [
    { type: 'video', src: '/HomeCarousel/VID-20250609-WA0009.mp4' },
    { type: 'video', src: '/HomeCarousel/VID-20250610-WA0082.mp4' },
    { type: 'video', src: '/HomeCarousel/VID-20250609-WA0014.mp4' },
    { type: 'video', src: '/HomeCarousel/VID-20250610-WA0076.mp4' },
    { type: 'image', src: '/HomeCarousel/IMG-20250610-WA0023.jpg', alt: 'Delicious Dish' },
    { type: 'video', src: '/HomeCarousel/VID-20250609-WA0011.mp4' },
  ];

  // Only these videos should play audio; others remain muted
  const unmutedVideos = ['/HomeCarousel/VID-20250610-WA0076.mp4', '/HomeCarousel/VID-20250610-WA0082.mp4'];

  // Preload all carousel images and videos for smoother transitions
  useEffect(() => {
    media.forEach(item => {
      if (item.type === 'image') {
        const img = new window.Image();
        img.src = item.src;
      } else if (item.type === 'video') {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = item.src;
        document.head.appendChild(link);
      }
    });
  }, []);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const fadeAudioInterval = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let timeout;
    const video = videoRef.current;
    if (media[current].type === 'image') {
      timeout = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % media.length);
      }, 4000);
    } else if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Video autoplay failed:', error);
        });
      }
      const onEnded = () => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % media.length);
      };
      video.addEventListener('ended', onEnded);
      return () => video.removeEventListener('ended', onEnded);
    }
    return () => clearTimeout(timeout);
  }, [current]);
  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
  };
  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % media.length);
  };

  // Animation variants for staggering list items
  const listContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };
  const listItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="bg-your-cream">
      {/* Hero Section */}
      <section className="relative min-h-[70svh] flex items-center justify-center overflow-hidden bg-your-black">
        <motion.div
          className="absolute inset-0 z-0 will-change-transform"
          initial={{ scale: 1, x: 0, y: 0 }}
          animate={{ scale: 1.05, x: 20, y: -10 }}
          transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
        >
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <img
            src="/Truck/IMG-20250603-WA0005.jpg"
            alt="Premium Catering"
            className="transform-gpu object-cover absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
          <div className="w-full text-center">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mb-6 md:mb-8"
            >
              <h1 className="text-4xl md:text-4xl lg:text-7xl font-display font-bold tracking-tight leading-tight">
                <span className="text-your-orange block">Catering Your Events</span>
              </h1>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="text-lg md:text-xl lg:text-2xl text-white font-merriweather leading-relaxed max-w-10xl mx-auto mb-4"
            >
              Flavors that bring people together — crafted for unforgettable gatherings.
            </motion.p>

          </div>
        </div>
      </section>                                      

      {/* Page Content */}
      <div className="max-w-7xl mx-auto mt-2 px-4 py-16 space-y-20">
        {/* Catering Carousel Section */}
        <section ref={sectionRef} className="pt-6 pb-12 md:pt-10 md:pb-20 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-6xl relative z-10">
            {/* Text Column */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, type: 'spring' }}
              className="w-full md:w-1/2 text-center md:text-left relative"
            >
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-gradient-to-br from-yellow-100/40 via-orange-100/20 to-white/0 rounded-full blur-2xl opacity-60 -z-10" />

              <h3 className="text-3xl md:text-4xl font-display font-bold text-your-orange mb-4 drop-shadow-sm">
                Catering Services
              </h3>

              <p className="text-lg md:text-xl text-your-black mb-4 font-medium">
              Bring the vibrant taste of India to your next event with <span className="font-samarkan font-bold text-2xl text-your-orange">your</span> <span className="font-semibold text-your-black">brand</span>. Our handcrafted dishes and heartfelt hospitality make every celebration unforgettable — whether it’s an intimate gathering or a grand occasion.
              </p>
              <p className="text-lg md:text-xl text-your-black mb-4 font-medium">
              We don’t just cater meals — we deliver an experience.
              </p>

              <motion.ul
                variants={listContainer}
                initial="hidden"
                animate="visible"
                className="list-disc pl-5 text-your-black space-y-3 text-base md:text-lg font-medium"
              >
                <motion.li variants={listItem}>
                  📋 Customizable menus for weddings, corporate events, festivals, and private celebrations.
                </motion.li>
                <motion.li variants={listItem}>
                  🍽️ Homemade dishes cooked with bold spices and traditional flavors.
                </motion.li>
                <motion.li variants={listItem}>
                  🚚 On-site food truck catering — fully equipped to serve hot, fresh meals at your party.
                </motion.li>
                <motion.li variants={listItem}>
                  👨‍🍳 Professional & Friendly Team that ensures smooth service, from setup to the last bite.
                </motion.li>
              </motion.ul>
            </motion.div>
            {/* Carousel Column */}
            <div className="w-full md:w-1/2 flex justify-center items-center relative">
              <div className="w-[800px] h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center relative">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div key={current} custom={direction} initial={{ opacity: 0, x: direction > 0 ? 120 : -120 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction > 0 ? -120 : 120 }} transition={{ duration: 0.5, type: 'spring' }} className="absolute inset-0 flex items-center justify-center">
                    {media[current].type === 'image' ? (
                      <img src={media[current].src} alt={media[current].alt || ''} className="object-cover w-full h-full" />
                    ) : (
                      <video ref={videoRef} src={media[current].src} autoPlay muted={!unmutedVideos.includes(media[current].src)} playsInline preload="auto" className="object-cover w-full h-full" title={media[current].alt} />
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
                  <button onClick={handlePrev} aria-label="Previous" className="bg-white/80 hover:bg-yellow-400/90 text-yellow-700 hover:text-white rounded-full p-3 shadow transition-colors">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={handleNext} aria-label="Next" className="bg-white/80 hover:bg-yellow-400/90 text-yellow-700 hover:text-white rounded-full p-3 shadow transition-colors">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tray Pricing Download */}
        <section className="text-center">
          <h2 className="text-3xl font-display font-bold text-your-black mb-4">
            Tray Pricing
          </h2>
          <p className="text-your-black mb-4 text-2xl font-medium font-semibold max-w-3xl mx-auto">
            Don't need our food truck at your event?{' '}
            <motion.span
              initial={{ y: 1 }}
              animate={{ y: [-3,4] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              className="inline-block"
            >
              😔
            </motion.span>
            <br />
          </p>
          <p className="text-gray-600 text-lg font-medium max-w-7xl mx-auto mb-4">
            We've got you covered. You can still enjoy our delicious, handcrafted dishes through our convenient tray ordering service<br /> — perfect for home parties, office lunches, and small gatherings.
          </p>  

          <p className="text-gray-600 text-lg font-medium max-w-3xl mx-auto">
            Fill out the{' '}
            <a href="/#connect" className="text-your-orange underline hover:opacity-80 font-semibold">
              Connect With Us
            </a>{' '}
            form below to inquire about tray pricing and place your order.
          </p>
        </section>

         {/* Contact Information and Quote Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Contact Information */}
            <section className="bg-white rounded-xl shadow-lg pt-12 pb-12 px-6 h-full flex flex-col space-y-6">
              <h2 className="text-3xl font-display font-bold text-your-black mb-8 text-center">
                Connect With Us
              </h2>

              {/* Phone & Email side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center space-x-4">
                  <Phone className="h-6 w-6 text-your-orange" />
                  <a
                    href={`tel:${siteConfig.phoneE164.replace(/\D/g, '')}`}
                    className="text-gray-700 hover:text-your-orange font-medium text-lg"
                  >
                    {siteConfig.phoneDisplay}
                  </a>
                </div>

                <div className="flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-your-orange" />
                  <a
                    href={`mailto:${siteConfig.emailContact}`}
                    className="text-gray-700 hover:text-your-orange font-medium text-lg"
                  >
                    {siteConfig.emailContact}
                  </a>
                </div>
              </div>

              {/* Centered Location */}
              <div className="flex items-center justify-center space-x-4">
                <MapPin className="h-6 w-6 text-your-orange" />
                <a
                  href={siteConfig.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-your-orange text-center font-medium text-lg"
                >
                  {siteConfig.addressDisplay}
                </a>
              </div>
            </section>

            {/* Get a Quote CTA */}
            <section className="pt-12 pb-12 rounded-xl bg-your-orange overflow-hidden flex items-center justify-center h-full">
              <div className="relative z-10 max-w-xl mx-auto px-6 md:px-10 text-center space-y-4">
                <h3 className="text-3xl font-display text-white font-bold">
                  Get a Custom Quote
                </h3>
                <p className="text-white text-lg font-semibold leading-relaxed">
                Contact us today to discuss your catering needs and get a custom quote.
                </p>
                <PulsatingButton
                  onClick={handleQuoteClick}
                  pulseColor="rgba(255,255,255,0.5)"
                  duration="4s"
                  className="mx-auto block px-6 py-3 bg-white text-your-black font-semibold rounded-xl shadow-lg"
                >
                  Get a Quote
                </PulsatingButton>
              </div>
            </section>
          </div>
        </div>
      </div>
  );
};

export default Catering; 
