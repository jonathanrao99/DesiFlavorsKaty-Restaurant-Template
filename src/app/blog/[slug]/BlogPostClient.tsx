"use client";
import Script from 'next/script';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

interface Post {
  slug: string;
  title: string;
  content: string;
  image: string;
}

export default function BlogPostClient({ post }: { post: Post }) {
  const heroSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroSectionRef, offset: ['start start', 'end start'] });
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 1 });
  const scale = useTransform(springProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(springProgress, [0, 1], [1, 0.7]);

  // Render rich content based on post slug
  const renderContent = (post: Post) => {
    switch (post.slug) {
      case 'our-secret-to-perfect-biryani':
        return (
          <>
            <p>Our biryani starts with a meticulous marination process: tender chicken pieces bathed in yogurt, garlic, ginger, and an aromatic spice blend, left to soak for hours to develop depth of flavor.</p>
            <Image src="/Truck/truck-1.jpg" alt="Marinating chicken" className="w-full rounded-md mb-4" width={500} height={300} loading="lazy" decoding="async" />
            <p>We layer fragrant basmati rice over the marinated meat, sealing it inside a pot for the traditional dum technique. Steam gently cooks the layers, resulting in a steam-infused aroma that captivates the senses.</p>
            <video controls className="w-full rounded-md mb-4">
              <source src="/HomeCarousel/VID-20250609-WA0009.mp4" type="video/mp4" />
            </video>
            <p>The final unveiling reveals perfectly cooked grains tinted with saffron, tender meat, and a burst of spices. Perfect for celebrations, our biryani is the star of any gathering.</p>
          </>
        );
      case 'meet-the-chef-a-journey-in-indian-cuisine':
        return (
          <>
            <p>Chef Jaladevi grew up steeped in family culinary traditions, learning the art of spice blending and slow cooking from her grandmother's kitchen in India.</p>
            <Image src="/HomeCarousel/IMG-20250609-WA0005.jpg" alt="Chef preparing dishes" className="w-full rounded-md mb-4" width={500} height={300} loading="lazy" decoding="async" />
            <p>Her travels across India—from the fragrant kitchens of Hyderabad to the royal courts of Lucknow—shaped her craft, leading to a repertoire of authentic regional specialties.</p>
            <video controls className="w-full rounded-md mb-4">
              <source src="/HomeCarousel/VID-20250609-WA0014.mp4" type="video/mp4" />
            </video>
            <p>At Desi Flavors, she pours this lifetime of experience into every dish, ensuring each bite tells a story of heritage and passion.</p>
          </>
        );
      case 'how-to-host-the-perfect-indian-party':
        return (
          <>
            <p>Hosting an unforgettable Indian party is all about balance—start with flavorful appetizers like samosas and pakoras, paired with cooling chutneys.</p>
            <Image src="/HomeCarousel/IMG-20250609-WA0007.jpg" alt="Party spread" className="w-full rounded-md mb-4" width={500} height={300} loading="lazy" decoding="async" />
            <p>Build a diverse menu: savory curries, biryani, fresh naan, and rice dishes. Offer a mix of vegetarian and meat options to cater to every guest.</p>
            <video controls className="w-full rounded-md mb-4">
              <source src="/HomeCarousel/VID-20250609-WA0011.mp4" type="video/mp4" />
            </video>
            <p>Don't forget vibrant garnishes—fresh cilantro, lemon wedges, and fried onions provide color and bursts of flavor. Keep drinks like mango lassi or masala chai on hand to complement the spices.</p>
          </>
        );
      case 'behind-the-scenes-food-truck-life':
        return (
          <>
            <p>Behind the scenes of our food truck is a symphony of early mornings, careful prep, and nonstop enthusiasm. Ingredients are hand-chopped and mixed fresh each day.</p>
            <Image src="/Truck/IMG-20250610-WA0005.jpg" alt="Team prepping" className="w-full rounded-md mb-4" width={500} height={300} loading="lazy" decoding="async" />
            <p>We load our truck with pride—each container eco-friendly and ready to deliver authentic Indian flavors straight to your community events and gatherings.</p>
            <video controls className="w-full rounded-md mb-4">
              <source src="/HomeCarousel/VID-20250610-WA0080.mp4" type="video/mp4" />
            </video>
            <p>From the first customer served to the last dish plated, our team's passion drives every mile. Swing by to see our mobile kitchen in action!</p>
          </>
        );
      default:
        return <p>{post.content}</p>;
    }
  };

  return (
    <main>
      <section
        ref={heroSectionRef}
        className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />
        <motion.div
          style={{ scale, opacity }}
          className="absolute inset-0 z-0 will-change-transform"
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
        >
          <Image
            src={post.image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
            width={1000}
            height={600}
            loading="lazy"
            decoding="async"
          />
        </motion.div>
        <div className="relative z-20 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-display font-bold text-white"
          >
            {post.title}
          </motion.h1>
        </div>
      </section>
      <div className="min-h-screen bg-desi-cream px-4 md:px-6 py-16 max-w-3xl mx-auto">
        <article className="prose prose-lg text-gray-800 mb-12">
          {renderContent(post)}
        </article>
        {/* Elfsight Comments */}
        <Script src="https://static.elfsight.com/platform/platform.js" async />
        <div
          className="elfsight-app-953a967d-ba70-46ea-99f9-7542139bf0e2"
          data-elfsight-app-lazy
        ></div>
      </div>
    </main>
  );
} 