"use client";

import Link from 'next/link';
import FeaturedStories from '@/components/FeaturedStories';
import ImpactDashboard from '@/components/ImpactDashboard';
import Carousel from '@/components/Carousel';
import { motion } from 'framer-motion';

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Hero Section with Carousel Background */}
      <section className="relative w-full min-h-[90dvh] flex items-center justify-center overflow-hidden -mt-28">
        <Carousel />
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-48 pb-12 md:pt-40 md:pb-20"
        >
          <motion.h1 variants={item} className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-lg">
            Real stories. Real pain. <br />
            <span className="text-accent lg:text-5xl text-glow">Real strength.</span>
          </motion.h1>
          
          <motion.p variants={item} className="text-base sm:text-lg md:text-xl text-white/90 mb-10 leading-relaxed font-light max-w-2xl mx-auto drop-shadow-md">
            A space to understand life with Sickle cell disease from those who live it and those who witness it.
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/submit"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-accent text-white hover:bg-accent-hover transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
              Share Your Journey
            </Link>
            <Link
              href="/resources"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-secondary border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/5 transition-all font-semibold shadow-sm hover:-translate-y-1 active:scale-95"
            >
              Explore Knowledge Hub
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Decorative elements removed */}
      </section>

      {/* Container for the rest of the content */}
      <div className="max-w-5xl mx-auto w-full px-6 flex flex-col gap-24">
        {/* Impact Dashboard */}
        <section className="max-w-3xl mx-auto w-full">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Our Collective Impact</h2>
          <ImpactDashboard />
        </section>

        {/* Why I Built This */}
        <section className="max-w-4xl mx-auto w-full mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="border-y border-gray-100 py-16 flex flex-col md:flex-row gap-12 items-center"
          >
            <div className="flex-shrink-0 md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-20 h-20 rounded-full bg-accent text-white flex items-center justify-center font-bold text-3xl shadow-lg mb-6">
                I
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Why I Built This
              </h2>
            </div>
            <div className="md:w-2/3 text-gray-600 leading-relaxed font-medium text-xl space-y-6">
              <p>For a long time, many of my experiences living with Sickle cell disease felt difficult to explain to others.</p>
              <p>This platform was created to bridge that gap to give people a way to share, listen and understand what life really feels like beyond the surface.</p>
              <p>Because sometimes, the most powerful way to create awareness is simply to listen.</p>
            </div>
          </motion.div>
        </section>

        {/* Featured Stories */}
        <section className="w-full mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-accent">Story of the Week</h2>
            <Link href="/stories" className="text-sm font-medium text-accent hover:text-accent-hover">
              View all &rarr;
            </Link>
          </div>
          <div>
            <FeaturedStories />
          </div>
        </section>
      </div>
    </div>
  );
}
