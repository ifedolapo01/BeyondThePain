"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';

import CommentSection from '@/components/CommentSection';

interface Story {
  title: string;
  category: "Patient" | "Caregiver" | "Observer";
  story: string;
  authorName?: string;
  authorAge?: string;
  empathyCount?: number;
  strengthCount?: number;
}

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [storyData, setStoryData] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reacted, setReacted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const docRef = doc(db, "stories", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setStoryData(docSnap.data() as Story);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching story:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  const handleReaction = async (type: 'empathyCount' | 'strengthCount') => {
    if (reacted[type]) return;

    try {
      const docRef = doc(db, "stories", id);
      await updateDoc(docRef, {
        [type]: increment(1)
      });
      
      setStoryData(prev => prev ? {
        ...prev,
        [type]: (prev[type] || 0) + 1
      } : null);
      
      setReacted(prev => ({ ...prev, [type]: true }));
    } catch (error) {
      console.error("Error reacting:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (notFound || !storyData) {
    return (
      <div className="text-center pt-24 min-h-[50vh]">
        <h1 className="text-2xl font-bold">Story Not Found</h1>
        <p className="text-gray-500 mt-2">The story you are looking for does not exist or has been removed.</p>
        <Link href="/stories" className="text-accent underline mt-4 block">Return to Stories</Link>
      </div>
    );
  }

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto pt-8 pb-16 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm mt-4"
    >
      <Link href="/stories" className="inline-block text-sm text-gray-500 hover:text-accent transition-colors mb-8 font-medium">
        &larr; Back to Stories
      </Link>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <span className="block text-sm font-semibold tracking-wider text-accent uppercase mb-1">
            {storyData.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {storyData.title}
          </h1>
        </div>
        <div className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 text-right">
          <p className="text-sm font-semibold text-gray-900">{storyData.authorName || "Anonymous"}</p>
          <p className="text-xs text-gray-500">{storyData.authorAge || "Age not specified"}</p>
        </div>
      </div>
      
      <div className="prose prose-lg text-gray-700 font-serif leading-relaxed whitespace-pre-wrap border-l-2 border-accent/20 pl-6 mb-12">
        {storyData.story}
      </div>

      <div className="mt-16 pt-8 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide block">React to this story</h3>
        <div className="flex gap-4">
          <button 
            onClick={() => handleReaction('empathyCount')}
            disabled={reacted['empathyCount']}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all font-medium border group ${
              reacted['empathyCount'] 
                ? 'bg-red-50 text-red-500 border-red-100 cursor-default' 
                : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500 border-gray-200'
            }`}
          >
            <span className={reacted['empathyCount'] ? '' : 'group-hover:scale-125 transition-transform'}>❤️</span>
            <span>Empathy</span>
            <span className={`ml-1 text-sm px-2 py-0.5 rounded-full border ${
              reacted['empathyCount'] ? 'bg-white border-red-100' : 'bg-white border-gray-100'
            }`}>
              {storyData.empathyCount || 0}
            </span>
          </button>
          <button 
            onClick={() => handleReaction('strengthCount')}
            disabled={reacted['strengthCount']}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all font-medium border group ${
              reacted['strengthCount'] 
                ? 'bg-orange-50 text-orange-500 border-orange-100 cursor-default' 
                : 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-500 border-gray-200'
            }`}
          >
            <span className={reacted['strengthCount'] ? '' : 'group-hover:scale-125 transition-transform'}>💪</span>
            <span>Strength</span>
            <span className={`ml-1 text-sm px-2 py-0.5 rounded-full border ${
              reacted['strengthCount'] ? 'bg-white border-orange-100' : 'bg-white border-gray-100'
            }`}>
              {storyData.strengthCount || 0}
            </span>
          </button>
        </div>
      </div>

      <CommentSection storyId={id} />
    </motion.article>
  );
}
