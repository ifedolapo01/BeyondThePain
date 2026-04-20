"use client";

import Link from 'next/link';
import FeaturedStories from '@/components/FeaturedStories';
import ImpactDashboard from '@/components/ImpactDashboard';
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
      {/* Hero Section */}
      <motion.section 
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center pt-16 md:pt-24 max-w-3xl mx-auto px-4"
      >
        <motion.h1 variants={item} className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
          Your Voice Matters Here. <br />
          <span className="text-accent lg:text-5xl text-glow">Beyond the Medical Report.</span>
        </motion.h1>
        <motion.p variants={item} className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-light">
          A calm and supportive space to share what it really feels like to live with or care for someone with sickle cell emotionally, mentally and practically.
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
      </motion.section>

      {/* Impact Dashboard */}
      <section className="max-w-4xl mx-auto w-full px-4">
        <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">Our Collective Impact</h2>
        <ImpactDashboard />
      </section>

      {/* Featured Stories */}
      <section>
        <div className="flex items-center justify-between mb-8 px-4 md:px-0">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Stories</h2>
          <Link href="/stories" className="text-sm font-medium text-accent hover:text-accent-hover">
            View all &rarr;
          </Link>
        </div>
        <div className="px-4 md:px-0">
          <FeaturedStories />
        </div>
      </section>
    </div>
  );
}
