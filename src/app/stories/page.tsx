"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StoryCard from '@/components/StoryCard';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Story {
  id: string;
  title: string;
  category: "Patient" | "Caregiver" | "Observer";
  snippet: string;
  authorName?: string;
  authorAge?: string;
}

export default function StoriesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedStories: Story[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Filter out archived stories
          if (data.status === 'archived') return;

          fetchedStories.push({
            id: doc.id,
            title: data.title,
            category: data.category,
            snippet: data.snippet,
            authorName: data.authorName,
            authorAge: data.authorAge
          });
        });
        setStories(fetchedStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const categories = ['All', 'Patient', 'Caregiver', 'Observer'] as const;

  const filteredStories = stories.filter(story => 
    activeCategory === 'All' ? true : story.category === activeCategory
  );

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Community Stories
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Read real experiences from patients, caregivers, and observers. Together, we find strength in shared vulnerability.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 justify-center mb-12 flex-wrap"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 block shadow-sm border ${
              activeCategory === category
                ? 'bg-accent text-white border-accent shadow-md scale-105'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : filteredStories.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeCategory.toLowerCase()} stories yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
            Be the first to share your experience as a {activeCategory.toLowerCase()}. Your voice can help others understand they are not alone.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Share Your Story
          </Link>
        </div>
      )}
    </div>
  );
}
