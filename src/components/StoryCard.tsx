"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export interface Story {
  id: string;
  title: string;
  category: 'Patient' | 'Caregiver' | 'Observer';
  snippet: string;
  authorName?: string;
  authorAge?: string;
}

export default function StoryCard({ story }: { story: Story }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Link
        href={`/stories/${story.id}`}
        className="block group h-full"
      >
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 h-full flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold tracking-wider text-accent uppercase block">
              {story.category}
            </span>
            {(story.authorName || story.authorAge) && (
              <span className="text-xs text-gray-400 font-medium">
                {story.authorName || "Anonymous"} {story.authorAge && story.authorAge !== "Prefer not to say" ? `(${story.authorAge})` : ""}
              </span>
            )}
          </div>
          <h2 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-accent transition-colors block">
            {story.title}
          </h2>
          <p className="text-gray-600 line-clamp-3 leading-relaxed flex-grow block">
            {story.snippet}
          </p>
          <div className="mt-4 flex items-center text-accent font-semibold text-sm group-hover:text-accent-hover transition-colors">
            <span>Read Full Story</span>
            <svg 
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
