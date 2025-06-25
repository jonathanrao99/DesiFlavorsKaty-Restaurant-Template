'use client';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { fadeInUp } from '@/utils/motion.variants';
import { useRef } from 'react';

export default function BlogPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const springConfig = { stiffness: 100, damping: 30, mass: 1 };
  const springProgress = useSpring(scrollYProgress, springConfig);
  const scale = useTransform(springProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(springProgress, [0, 1], [1, 0.7]);

  const posts = [
    { slug: 'our-secret-to-perfect-biryani', title: 'Our Secret to Perfect Biryani', description: 'Discover the spices and techniques that make our biryani a customer favorite. From marination to the final dum, we spill the beans!', image: '/Truck/truck-1.jpg' },
    { slug: 'meet-the-chef-a-journey-in-indian-cuisine', title: 'Meet the Chef: A Journey in Indian Cuisine', description: 'Get to know the culinary mastermind behind Desi Flavors Katy, their favorite dishes, and what inspires our menu.', image: '/Truck/truck-2.jpg' },
    { slug: 'how-to-host-the-perfect-indian-party', title: 'How to Host the Perfect Indian Party', description: 'Tips and tricks for planning a memorable event with authentic Indian food, from menu selection to presentation.', image: '/Truck/truck-3.jpg' },
    { slug: 'behind-the-scenes-food-truck-life', title: 'Behind the Scenes: Food Truck Life', description: 'A day in the life of our food truck team—prepping, serving, and sharing the love of Indian cuisine with Katy, TX.', image: '/Truck/truck-4.jpg' }
  ];

  return (
    <main className="min-h-screen bg-desi-cream">
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
        {/* Background Image with Zoom Effect */}
        <motion.div
          ref={heroRef}
          style={{ scale, opacity }}
          className="absolute inset-0 z-0 will-change-transform"
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
        >
          <img
            src="/Truck/IMG-20250610-WA0011.jpg"
            alt="Desi Flavors Blog"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
        {/* Content */}
        <div className="relative z-20 container mx-auto px-4 max-w-5xl text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mb-6 md:mb-8"
            >
              <h1 className="text-4xl md:text-4xl lg:text-7xl font-display font-bold tracking-tight leading-tight">
                <span className="text-white block">Desi Flavors Blog</span>
              </h1>
            </motion.div>
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="text-lg md:text-xl text-white leading-relaxed max-w-5xl mx-auto mb-4 font-sans font-bold"
            >
              Stories, recipes, and updates from the Desi Flavors Katy team. Check back for new dishes, behind-the-scenes, and more!
            </motion.p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Latest Articles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Stay updated with our stories, recipes, and behind-the-scenes.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="block">
                <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105" />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-700 flex-grow">{post.description}</p>
                    <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex items-center text-desi-orange font-medium hover:underline">Read More →</Link>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 
