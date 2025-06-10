import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageProps {
  src: string;
  alt: string;
  category?: string;
}

interface ImageGalleryProps {
  images: ImageProps[];
  className?: string;
}

const ImageGallery = ({ images, className = '' }: ImageGalleryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(images.map(img => img.category || 'Uncategorized')))];
  
  // Filter images by selected category
  const filteredImages = selectedCategory && selectedCategory !== 'All'
    ? images.filter(img => img.category === selectedCategory)
    : images;
  
  // Handle image loaded
  const handleImageLoaded = (src: string) => {
    setLoadedImages(prev => new Set(prev).add(src));
  };
  
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category === 'All' ? null : category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              (category === 'All' && !selectedCategory) || category === selectedCategory
                ? 'bg-desi-orange text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredImages.map((image, index) => (
          <div 
            key={index} 
            className={`aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all 
              duration-300 cursor-pointer relative blur-load ${
                loadedImages.has(image.src) ? 'loaded' : ''
              }`}
            style={{ 
              animationDelay: `${index * 100}ms`,
              backgroundColor: '#f8f8f8' 
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onLoad={() => handleImageLoaded(image.src)}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
