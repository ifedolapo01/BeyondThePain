"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import ResourceCard, { Resource } from '@/components/ResourceCard';
import Link from 'next/link';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Hospital', 'Treatment', 'Lifestyle', 'General'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedResources: Resource[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'archived') {
            fetchedResources.push({ id: doc.id, ...data } as Resource);
          }
        });
        setResources(fetchedResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter(res => 
    activeCategory === 'All' ? true : res.category === activeCategory
  );

  return (
    <div className="max-w-5xl mx-auto pt-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-4">
          Community <span className="text-[#008080]">Hub</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
          A collective knowledge base for the sickle cell community. Find recommended hospitals, treatment tips, and lifestyle advice shared by people who understand.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 justify-center mb-12 flex-wrap"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 border ${
              activeCategory === category
                ? 'bg-[#008080] text-white border-[#008080] shadow-md shadow-[#008080]/20 scale-105'
                : 'bg-white border-gray-200 text-gray-500 hover:border-[#008080]/40 hover:text-[#008080]'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008080]"></div>
        </div>
      ) : filteredResources.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
           <div className="w-16 h-16 bg-[#008080]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            💡
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeCategory.toLowerCase()} insights yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Be the first to share helpful information in this category.
          </p>
          <Link
            href="/submit?type=resource"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-[#008080] text-white hover:bg-[#006666] transition-all font-bold shadow-lg shadow-[#008080]/10"
          >
            Share an Insight
          </Link>
        </div>
      )}

      {/* Floating CTA for Mobile */}
      <div className="fixed bottom-8 right-8 z-40 md:hidden">
        <Link 
          href="/submit?type=resource"
          className="w-14 h-14 rounded-full bg-[#008080] text-white flex items-center justify-center shadow-xl shadow-[#008080]/40 text-2xl"
        >
          +
        </Link>
      </div>
    </div>
  );
}
