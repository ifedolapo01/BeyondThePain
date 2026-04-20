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
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredStories = stories.filter(story => {
    const matchesCategory = activeCategory === 'All' ? true : story.category === activeCategory;
    const matchesSearch = 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.authorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto pt-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center px-4"
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Community Stories
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto mb-8">
          Read real experiences from patients, caregivers, and observers. Together, we find strength in shared vulnerability.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search stories by title, author, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl leading-5 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 justify-start md:justify-center mb-10 flex-nowrap overflow-x-auto pb-2 px-1 scrollbar-none"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 block shadow-sm border whitespace-nowrap flex-shrink-0 ${
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No matching stories found' : `No ${activeCategory.toLowerCase()} stories yet`}
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed">
            {searchQuery 
              ? "We couldn't find any stories matching your search. Try a different keyword or category."
              : `Be the first to share your experience as a ${activeCategory.toLowerCase()}. Your voice can help others understand they are not alone.`
            }
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-accent font-bold hover:underline"
            >
              Clear Search
            </button>
          ) : (
            <Link
              href="/submit"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Share Your Story
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
