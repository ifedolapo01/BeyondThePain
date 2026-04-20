"use client";

import { useState, useEffect, Suspense } from 'react';
import StoryForm from '@/components/StoryForm';
import ResourceForm from '@/components/ResourceForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

function SubmitFormContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'story' | 'resource'>('story');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'resource') {
      setActiveTab('resource');
    }
  }, [searchParams]);

  return (
    <>
      {/* Tab Switcher */}
      <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-12 max-w-sm mx-auto shadow-inner border border-gray-200">
        <button
          onClick={() => setActiveTab('story')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'story'
              ? 'bg-white text-accent shadow-md'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Share Story
        </button>
        <button
          onClick={() => setActiveTab('resource')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'resource'
              ? 'bg-white text-[#008080] shadow-md'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Share Tip/Resource
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'story' ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: activeTab === 'story' ? 10 : -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'story' ? <StoryForm /> : <ResourceForm />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto pt-8 pb-20 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Share with the Community
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto">
          Whether it&apos;s a personal journey or a practical tip, your contribution helps build a stronger, more informed space.
        </p>
      </div>

      <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>}>
        <SubmitFormContent />
      </Suspense>
    </div>
  );
}
