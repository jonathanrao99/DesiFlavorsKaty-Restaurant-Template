import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

export default function ImageCarousel({ images, alt = '' }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((current - 1 + images.length) % images.length);
  const next = () => setCurrent((current + 1) % images.length);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <button
        onClick={prev}
        className="absolute left-2 z-10 bg-black/30 p-1 rounded-full text-white hover:bg-black/40"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="w-full h-full relative">
        <img
          src={images[current]}
          alt={alt}
          className="object-cover w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <button
        onClick={next}
        className="absolute right-2 z-10 bg-black/30 p-1 rounded-full text-white hover:bg-black/40"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
} 