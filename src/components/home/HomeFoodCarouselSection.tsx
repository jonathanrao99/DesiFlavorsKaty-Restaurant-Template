import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const media = [
  { type: 'image', src: '/HomeCarousel/IMG-20250610-WA0008.jpg', alt: 'Fresh Indian Food 2' },
  { type: 'image', src: '/HomeCarousel/IMG-20250610-WA0023.jpg', alt: 'Fresh Indian Food 3' },
  { type: 'video', src: '/HomeCarousel/VID-20250610-WA0076.mp4', alt: 'Cooking Video 2' },
  { type: 'video', src: '/HomeCarousel/VID-20250610-WA0080.mp4', alt: 'Cooking Video 1' },
  { type: 'image', src: '/HomeCarousel/IMG-20250609-WA0005.jpg', alt: 'Fresh Indian Food 5' },
  { type: 'video', src: '/HomeCarousel/VID-20250609-WA0009.mp4', alt: 'Cooking Video 5' },
  { type: 'image', src: '/HomeCarousel/IMG-20250609-WA0007.jpg', alt: 'Fresh Indian Food 4' },
  { type: 'image', src: '/HomeCarousel/IMG-20250603-WA0007.jpg', alt: 'Fresh Indian Food 6' },
  { type: 'video', src: '/HomeCarousel/VID-20250610-WA0082.mp4', alt: 'Cooking Video 3' },
  { type: 'video', src: '/HomeCarousel/VID-20250609-WA0014.mp4', alt: 'Cooking Video 4' },
];

export default function HomeFoodCarouselSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const fadeAudioInterval = useRef(null);
  // Only these videos should play audio; others remain muted
  const unmutedVideos = ['/HomeCarousel/VID-20250610-WA0076.mp4', '/HomeCarousel/VID-20250610-WA0082.mp4'];

  // Intersection Observer to detect if section is in view
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Fade in/out audio for video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const targetVolume = inView ? 1 : 0;
    const step = inView ? 0.5 : -0.5;
    clearInterval(fadeAudioInterval.current);
    fadeAudioInterval.current = setInterval(() => {
      if (!video) return;
      const newVolume = video.volume + step;
      if ((step > 0 && newVolume >= targetVolume) || (step < 0 && newVolume <= targetVolume)) {
        video.volume = targetVolume;
        clearInterval(fadeAudioInterval.current);
      } else {
        video.volume = Math.max(0, Math.min(1, newVolume));
      }
    }, 50);
    return () => clearInterval(fadeAudioInterval.current);
  }, [inView, current]);

  // Auto-advance: images for 4s, videos on ended
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
      return () => {
        video.removeEventListener('ended', onEnded);
      };
    }
    return () => clearTimeout(timeout);
  }, [current]);

  // Preload all carousel images and videos
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

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % media.length);
  };

  return (
    <section ref={sectionRef} className="w-full bg-gradient-to-b from-transparent via-orange-50 to-white py-12 md:py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <Image src="/Ingredients/mint-removebg-preview.png" alt="Mint" width={80} height={80} className="absolute top-8 left-8 opacity-10 rotate-12 select-none pointer-events-none z-0" />
      <Image src="/Ingredients/cinamon-removebg-preview.png" alt="Cinnamon" width={90} height={90} className="absolute bottom-8 right-8 opacity-10 -rotate-12 select-none pointer-events-none z-0" />
      <svg className="absolute right-1 top-1/4 w-40 h-40 opacity-10 z-0" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" stroke="#FFD700" strokeWidth="4" fill="none" /><path d="M50 10 Q60 30 50 50 Q40 70 50 90" stroke="#FFD700" strokeWidth="2" fill="none" /></svg>
      {/* Gold shimmer accent */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-yellow-200/30 via-yellow-100/10 to-orange-100/0 blur-2xl opacity-40 z-0" />
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-6xl relative z-10">
        {/* Carousel */}
        <div className="w-full md:w-1/2 flex justify-center items-center relative">
          <div className="w-[800px] h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center relative">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 120 : -120 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -120 : 120 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {media[current].type === 'image' ? (
                  <Image
                    src={media[current].src}
                    alt={media[current].alt}
                    width={800}
                    height={600}
                    className="object-cover w-full h-full"
                    priority={current === 0}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={media[current].src}
                    autoPlay
                    muted={!unmutedVideos.includes(media[current].src)}
                    playsInline
                    preload="auto"
                    className="object-cover w-full h-full"
                    title={media[current].alt}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            {/* Controls at bottom of carousel */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
              <button onClick={handlePrev} aria-label="Previous" className="bg-white/80 hover:bg-desi-orange/90 text-desi-orange hover:text-white rounded-full p-3 shadow transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={handleNext} aria-label="Next" className="bg-white/80 hover:bg-desi-orange/90 text-desi-orange hover:text-white rounded-full p-3 shadow transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
        {/* Text */}
        <motion.div
          className="w-full md:w-1/2 text-center md:text-left relative"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: 'spring' }}
        >
          {/* Decorative bg behind text */}
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-gradient-to-br from-yellow-100/40 via-orange-100/20 to-white/0 rounded-full blur-2xl opacity-60 -z-10" />
          <h3 className="text-3xl md:text-4xl font-display font-bold text-desi-black mb-4 drop-shadow-sm">Made Fresh, From our Heart to your Plate</h3>
          <p className="text-lg md:text-xl text-gray-700 mb-4 font-medium">
          Experience the essence of Indian cooking with every bite. At <span className="font-display font-semibold text-desi-orange">Desi Flavors Katy</span>, we bring together time-honored traditions and a spark of creativity—using only the freshest ingredients and authentic, hand-ground spices. From the first sizzle in the pan to the comforting aroma that fills the air, every dish is a warm reminder of home, crafted with love and served with pride.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 