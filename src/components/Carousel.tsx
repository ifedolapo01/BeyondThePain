"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const images = [
  {
    src: '/images/carousel/consultation.jpg',
    mobileSrc: '/images/carousel/consultation_mobile.png',
    alt: 'Medical Consultation',
    caption: 'Seeking guidance and care.'
  },
  {
    src: '/images/carousel/awareness.jpg',
    mobileSrc: '/images/carousel/awareness_mobile.png',
    alt: 'Sickle Cell Awareness',
    caption: 'Visible. Heard. Supported.'
  },
  {
    src: '/images/carousel/pain_2.jpg',
    mobileSrc: '/images/carousel/resilience_mobile.png',
    alt: 'Resilience in Difficulty',
    caption: 'Finding strength within.'
  },
  {
    src: '/images/carousel/microscopic_resilience.png',
    mobileSrc: '/images/carousel/microscopic_mobile.png',
    alt: 'Microscopic Resilience',
    caption: 'Strength at the cellular level.'
  },
  {
    src: '/images/carousel/morning_hope.png',
    mobileSrc: '/images/carousel/morning_hope_mobile.png',
    alt: 'Morning Hope',
    caption: 'Every sunrise brings new strength.'
  }
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(timer);
    };
  }, []);

  const currentImage = images[currentIndex];
  const imageSrc = isMobile ? (currentImage.mobileSrc || currentImage.src) : currentImage.src;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={imageSrc}
            alt={images[currentIndex].alt}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Dark Overlays for Readability */}
          <div className="absolute inset-0 bg-black/40 z-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-0" />
        </motion.div>
      </AnimatePresence>
      
      {/* Subtle Caption in Corner */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:block">
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-white/60 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
        >
          {images[currentIndex].caption}
        </motion.p>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-6 md:w-8 bg-accent' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
