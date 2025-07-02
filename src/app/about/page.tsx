'use client';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, ArrowRight, X, Star, ChevronDown, ExternalLink, Instagram, Facebook, Youtube } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { fadeInUp } from '@/utils/motion.variants';
import MagneticButton from '@/components/MagneticButton';
import AnimatedCardGrid, { AnimatedCard } from '@/components/AnimatedCardGrid';
import Image from 'next/image';
import Head from 'next/head';
// import Script from 'next/script';

// Custom X icon component
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

const About = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = [
    useRef<HTMLElement>(null), // Hero
    useRef<HTMLElement>(null), // Our Story
    useRef<HTMLElement>(null), // Values
    useRef<HTMLElement>(null), // Team
    useRef<HTMLElement>(null), // Gallery
    useRef<HTMLElement>(null), // Visit
  ];

  // Hero section scroll effect
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Values section scroll effect for parallax decorations
  const { scrollYProgress: valuesScrollY } = useScroll({
    target: sectionRefs[2],
    offset: ["start end", "end start"]
  });

  // Team section scroll effect for decorative elements
  const { scrollYProgress: teamScrollYProgress } = useScroll({
    target: sectionRefs[3],
    offset: ["start end", "end start"]
  });

  const [hasAnimatedTeam, setHasAnimatedTeam] = useState(false);
  useEffect(() => {
    const timerTeam = setTimeout(() => { setHasAnimatedTeam(true); }, 1000);
    return () => clearTimeout(timerTeam);
  }, []);

  // Use spring physics for smooth animation
  const springConfig = { stiffness: 50, damping: 20, mass: 1 };
  const springProgress = useSpring(scrollYProgress, springConfig);
  
  // Subtle zoom and fade effect
  const scale = useTransform(springProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(springProgress, [0, 1], [1, 0.7]);

  useEffect(() => {
    // Removed autoscroll to top
    // Set up intersection observers for each section
    const observers = sectionRefs.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(index);
          }
        },
        { threshold: 0.3 }
      );
      if (ref.current) {
        observer.observe(ref.current);
      }
      return observer;
    });
    return () => {
      observers.forEach((observer, index) => {
        if (sectionRefs[index].current) {
          observer.unobserve(sectionRefs[index].current!);
        }
      });
    };
  }, [sectionRefs]);

  // Gallery images
  const galleryImages = [
    { src: '/Truck/truck-1.jpg', alt: 'Our Food Truck Front View' },
    { src: '/Truck/truck-2.jpg', alt: 'Food Truck Side View' },
    { src: '/Truck/truck-3.jpg', alt: 'Food Truck Interior' },
    { src: '/Truck/truck-4.jpg', alt: 'Food Preparation' },
    { src: '/Truck/truck-5.jpg', alt: 'Customer Experience' },
    { src: '/Truck/truck-old.png', alt: 'Special Events' },
  ];

  // Navigation function
  const scrollToSection = (index: number) => {
    sectionRefs[index].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const truckImages = [
    { src: '/Truck/truck-1.jpg', alt: 'Our Food Truck Front View' },
    { src: '/Truck/truck-2.jpg', alt: 'Food Truck Side View' },
    { src: '/Truck/truck-3.jpg', alt: 'Food Truck Interior' },
    { src: '/Truck/truck-4.jpg', alt: 'Food Preparation' },
    { src: '/Truck/truck-5.jpg', alt: 'Customer Experience' },
  ];

  return (
    <Head>
      <title>About Us | Desi Flavors Hub</title>
      <meta name="description" content="Learn about Desi Flavors Hub, our story, and our passion for bringing authentic Indian cuisine to Katy, TX." />
      <meta property="og:title" content="About Us | Desi Flavors Hub" />
      <meta property="og:description" content="Learn about Desi Flavors Hub, our story, and our passion for bringing authentic Indian cuisine to Katy, TX." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://yourdomain.com/about" />
      <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Desi Flavors Hub",
          "url": "https://yourdomain.com/about",
          "logo": "https://yourdomain.com/og-image.jpg",
          "sameAs": [
            "https://www.facebook.com/yourpage",
            "https://www.instagram.com/yourpage"
          ]
        }
      `}</script>
    </Head>
    <main className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={sectionRefs[0]}
        className="relative h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10"></div>
        
        {/* Background Image with Zoom Effect */}
        <motion.div 
          ref={heroRef}
          style={{ scale, opacity }}
          className="absolute inset-0 z-0 will-change-transform"
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
        >
          <Image
            src="/Truck/truck-1.jpg"
            alt="Desi Flavors Food Truck"
            className="absolute inset-0 w-full h-full object-cover transform-gpu"
          />
        </motion.div>
        
        <div className="relative z-20 container mx-auto px-4 max-w-5xl">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="text-left text-white"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              <span className="block text-white mb-2">The Story Behind</span>
              <span className="bg-gradient-to-r from-desi-orange to-yellow-500 text-transparent bg-clip-text">
                Our Food Truck
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mb-8 text-gray-100">
              A culinary journey bringing authentic Indian flavors to Katy, with a focus on tradition, quality, and exceptional taste.
            </p>
            <div className="flex items-center space-x-4">
              
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="hidden md:flex text-desi-orange items-center cursor-pointer"
                onClick={() => scrollToSection(1)}
              >
                <span className="mr-2">Scroll to explore</span>
                <ChevronDown size={20} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section 
        ref={sectionRefs[1]}
        className="py-20 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden"
      >
        {/* HomeCarousel-style decorative background */}
        <Image src="/Ingredients/mint-removebg-preview.png" alt="Mint" width={80} height={80} className="absolute top-8 left-8 opacity-10 rotate-12 select-none pointer-events-none z-0" />
        <Image src="/Ingredients/cinamon-removebg-preview.png" alt="Cinnamon" width={90} height={90} className="absolute bottom-8 right-8 opacity-10 -rotate-12 select-none pointer-events-none z-0" />
        <svg className="absolute right-1 top-1/4 w-40 h-40 opacity-10 z-0" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" stroke="#FFD700" strokeWidth="4" fill="none" /><path d="M50 10 Q60 30 50 50 Q40 70 50 90" stroke="#FFD700" strokeWidth="2" fill="none" /></svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-yellow-200/30 via-yellow-100/10 to-orange-100/0 blur-2xl opacity-40 z-0" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
              viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-12 text-center"
            >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Our Culinary Journey
              </h2>
              <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-4xl text-gray-600 text-lg">
              Authentic Indian flavors, straight from our kitchen to Katy.
              </p>
            </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-xl md:text-2xl font-display font-semibold mb-6">From Home Kitchen to Food Truck</h3>
              <p className="text-gray-800 mb-6 text-lg md:text-xl">
                When we moved to Katy, we noticed something was missing - authentic Indian cuisine that reminded us of home. That's when we decided to bring our passion for Indian food to this vibrant community.
              </p>
              <p className="text-gray-800 text-lg md:text-xl">
                In February 2025, we launched <span className="font-bold"><span className="text-desi-orange font-samarkan text-2xl">Desi</span> Flavors Katy</span> with a simple mission: to serve exceptional Indian dishes that combine traditional recipes with modern culinary expertise. Every recipe we serve is a piece of our heritage, crafted with the same love and care that has been passed down through generations.
              </p>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="relative">
                <Image
                  src="/Truck/truck-3.jpg"
                  alt="Desi Flavors Food Preparation"
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section 
        ref={sectionRefs[2]}
        className="py-20 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden"
      >
        {/* Parallax decorative elements from Bestsellers Section */}
        <motion.div
          className="absolute top-0 left-0 w-24 h-24 bg-desi-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ y: valuesScrollY.get() * 20 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-48 h-48 bg-desi-orange/5 rounded-full translate-x-1/3 translate-y-1/3"
          style={{ y: -valuesScrollY.get() * 20 }}
        />
        <motion.div
          className="absolute top-1/4 left-10 w-12 h-12 bg-desi-orange/10 rounded-full"
          style={{ y: valuesScrollY.get() * 10 }}
        />
        <motion.div className="absolute left-10 bottom-20 w-3 h-3 rounded-full bg-desi-orange/40" animate={{ y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} viewport={{ once: true }} />
        <motion.div className="absolute right-1/3 top-40 w-4 h-4 rounded-full bg-desi-orange/30" animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} viewport={{ once: true }} />
        
        <div className="container mx-auto px-4 max-w-6xl relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Our Food Philosophy
            </h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-600 text-lg">
              The core values that guide every dish we prepare, ensuring an authentic and memorable dining experience
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Authentic Recipes",
                description: "We honor traditional recipes passed down through generations, ensuring authentic flavors in every bite.",
                icon: "/Ingredients/clove-removebg-preview.png",
                color: "from-orange-500 to-orange-600"
              },
              {
                title: "Premium Ingredients",
                description: "We source the finest ingredients and authentic spices, maintaining the highest standards of quality.",
                icon: "/Ingredients/mint-removebg-preview.png",
                color: "from-green-500 to-green-600"
              },
              {
                title: "Culinary Craftsmanship",
                description: "Our dishes blend time-honored techniques with modern expertise for a unique dining experience.",
                icon: "/Ingredients/cinamon-removebg-preview.png",
                color: "from-red-500 to-red-600"
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className={`h-2 w-full bg-gradient-to-r ${value.color}`}></div>
                <div className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mr-4">
                      <Image src={value.icon} alt={value.title} className="h-6 w-6 opacity-70" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
            <div className="md:flex">
              {/* Text Column */}
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold font-display mb-6">Our Quality Commitment</h3>
                <p className="text-gray-900 mb-6 text-lg">
                  Every dish at Desi Flavors is prepared with care, using hand-selected ingredients and authentic spices to create the perfect balance of flavors.
                </p>
                <ul className="space-y-4 font-bold">
                  {[
                    "House-made masala blends crafted daily",
                    "Locally sourced vegetables for freshness",
                    "Halal certified meats",
                    "No artificial preservatives or flavors"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <Star className="w-5 h-5 text-desi-orange mr-3 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image Column */}
              <div className="md:w-1/2 relative">
                <Image 
                  src="/biryani.png" 
                  alt="Signature Biryani" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
        </div>
      </section>

      {/* Team Section */}
      <section 
        ref={sectionRefs[3]}
        className="pt-8 pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden"
      >
        {/* Decorative elements with parallax */}
        <motion.div 
          className="absolute top-0 left-0 w-24 h-24 bg-desi-orange/5 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ y: teamScrollYProgress ? teamScrollYProgress.get() * 20 : 0 }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-48 h-48 bg-desi-orange/5 rounded-full translate-x-1/3 translate-y-1/3"
          style={{ y: teamScrollYProgress ? -teamScrollYProgress.get() * 20 : 0 }}
        />
        <motion.div 
          className="absolute top-1/4 right-10 w-12 h-12 bg-desi-orange/10 rounded-full"
          style={{ y: teamScrollYProgress ? teamScrollYProgress.get() * 10 : 0 }}
        />
        <motion.div 
          className="absolute left-10 bottom-20 w-3 h-3 rounded-full bg-desi-orange/40"
          animate={hasAnimatedTeam ? { y: 0, opacity: 0.6 } : { y: [0, -15, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: hasAnimatedTeam ? 0 : Infinity, ease: "easeInOut" }}
          viewport={{ once: true }}
        />
        <motion.div 
          className="absolute right-1/3 top-40 w-4 h-4 rounded-full bg-desi-orange/30"
          animate={hasAnimatedTeam ? { y: 0, opacity: 0.5 } : { y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: hasAnimatedTeam ? 0 : Infinity, ease: "easeInOut", delay: 1 }}
          viewport={{ once: true }}
        />
        
        <div className="container mx-auto px-4 max-w-6xl relative">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-600 text-lg">
              The passionate individuals behind Desi Flavors who bring authentic Indian cuisine to Katy
            </p>
          </motion.div>
          
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 flex justify-center"
          >
            <div className="max-w-2xl mx-auto">
              <AnimatedCard className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col items-center min-h-[600px] mb-10">
                <div className="w-72 h-72 rounded-full overflow-hidden mt-8 mb-4 border-4 border-desi-orange/20">
                  <Image src="/Truck/IMG-20250610-WA0005.jpg" alt="Founders" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="px-6 pt-6 pb-4 text-center">
                  <h3 className="text-xl font-display font-bold text-desi-black mb-1">Jaladevi & Venu Thota</h3>
                  <p className="text-desi-orange font-medium mb-3">Founders</p>
                  <p className="text-desi-black">
                    With over 20 years of experience in authentic Indian cuisine, Jaladevi brings her family recipes and culinary expertise to Desi Flavors. Venu manages the business operations and ensures every customer receives exceptional service. Together, their vision for authentic Indian flavors has made Desi Flavors a beloved destination for food enthusiasts in Katy.
                  </p>
                </div>
              </AnimatedCard>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section 
        ref={sectionRefs[4]}
        className="py-16 bg-gradient-to-b from-transparent via-orange-50 to-white relative overflow-hidden"
      >
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Our Gallery
            </h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-600 text-lg">
              A visual journey through our food truck, dishes, and memorable moments
            </p>
          </motion.div>
          
              <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
                viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
            {/* Bento Grid Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Large Image */}
              <AnimatedCard className="md:col-span-2 md:row-span-2 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image 
                  src="/Truck/truck-1.jpg" 
                  alt="Desi Flavors Food Truck" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onClick={() => setSelectedImage("/Truck/truck-1.jpg")}
                  loading="lazy"
                  decoding="async"
                />
              </AnimatedCard>
              
              {/* Medium Images */}
              <AnimatedCard className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image 
                  src="/Truck/truck-2.jpg" 
                  alt="Food Preparation" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onClick={() => setSelectedImage("/Truck/truck-2.jpg")}
                  loading="lazy"
                  decoding="async"
                />
              </AnimatedCard>
              
              <AnimatedCard className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image 
                  src="/Truck/truck-3.jpg" 
                  alt="Customer Experience" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onClick={() => setSelectedImage("/Truck/truck-3.jpg")}
                  loading="lazy"
                  decoding="async"
                />
              </AnimatedCard>
              
              {/* Small Images */}
              <AnimatedCard className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image 
                  src="/Truck/truck-4.jpg" 
                  alt="Special Dishes" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onClick={() => setSelectedImage("/Truck/truck-4.jpg")}
                  loading="lazy"
                  decoding="async"
                />
              </AnimatedCard>
              
              <AnimatedCard className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image 
                  src="/Truck/truck-5.jpg" 
                  alt="Food Truck Interior" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onClick={() => setSelectedImage("/Truck/truck-5.jpg")}
                  loading="lazy"
                  decoding="async"
                />
              </AnimatedCard>
              
              <AnimatedCard className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <Image 
                  src="/Truck/truck-old.png" 
                  alt="Special Events" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onClick={() => setSelectedImage("/Truck/truck-old.png")}
                  loading="lazy"
                  decoding="async"
                />
              </AnimatedCard>
            </div>
          </motion.div>
          
          
        </div>
      </section>

      {/* Image Popup */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-4xl w-full"
          >
            <button
              className="absolute -top-12 right-0 text-white hover:text-desi-orange transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <Image
              src={selectedImage}
              alt="Selected image"
              className="w-full h-auto rounded-lg"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          </div>
      )}

      {/* Visit Us Section */}
      <section 
        ref={sectionRefs[5]}
        className="py-20 bg-desi-black relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Visit Our Food Truck
            </h2>
            <div className="h-1 w-20 bg-desi-orange mb-6"></div>
            <p className="max-w-3xl text-gray-300 text-lg">
              Experience authentic Indian cuisine in the heart of Katy
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-display font-bold mb-6 text-white">Contact Information</h3>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Location</p>
                    <a 
                      href="https://maps.app.goo.gl/nWvCh23xWfzZfnL86" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    className="text-gray-300 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                  >
                    <span>1989 North Fry Rd, Katy, TX 77449</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Phone</p>
                    <a 
                      href="tel:+13468244212"
                    className="text-gray-300 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                  >
                    <span>+1 (346) 824-4212</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Email</p>
                    <a 
                      href="mailto:desiflavorskaty@gmail.com"
                    className="text-gray-300 hover:text-desi-orange transition-colors flex items-center gap-1 group"
                  >
                    <span>desiflavorskaty@gmail.com</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-desi-orange mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Hours</p>
                  <p className="text-gray-300">Monday - Sunday: </p>
                  <p className="text-gray-300">5:00 PM - 1:00 AM</p>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="pt-8">
                <h3 className="text-xl font-semibold text-white mb-6">Follow Us</h3>
                <div className="flex flex-wrap gap-8">
                  <a
                    href="https://www.facebook.com/profile.php?id=61574761892311"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-desi-orange transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a
                    href="https://instagram.com/desiflavorskaty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-desi-orange transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href="https://x.com/desiflavorskaty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-desi-orange transition-colors"
                  >
                    <XIcon className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@desiflavorskaty?lang=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-desi-orange transition-colors"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@desiflavorskaty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-desi-orange transition-colors"
                  >
                    <Youtube className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>
            
            {/* Right Column - Map */}
            <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden"
            >
                <div className="h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d891.9331375493595!2d-95.72059509999999!3d29.7958849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8641210045d45d63%3A0x3a9eebb90dacf13b!2sDesi%20Flavors%20(Food%20Truck)!5e0!3m2!1sen!2sus!4v1711409649044!5m2!1sen!2sus"
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
    </main>
  );
};

export default About;
