"use client";

import { motion } from 'framer-motion';

export interface Resource {
  id: string;
  title: string;
  category: 'Treatment' | 'Hospital' | 'Lifestyle' | 'General';
  sentiment?: 'Recommended' | 'Wary';
  content: string;
  authorName?: string;
  createdAt: any;
}

export default function ResourceCard({ resource }: { resource: Resource }) {
  const isHospital = resource.category === 'Hospital';
  const isWary = resource.sentiment === 'Wary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-[#008080]/20 transition-all duration-300 h-full flex flex-col relative overflow-hidden group">
        {/* Sentiment Badge for Hospitals */}
        {isHospital && (
          <div className={`absolute top-0 right-0 left-0 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white text-center ${isWary ? 'bg-orange-600' : 'bg-[#008080]'}`}>
            {isWary ? '⚠️ Proceed with Caution' : '👍 Highly Recommended'}
          </div>
        )}

        <div className={`flex justify-between items-start mb-3 ${isHospital ? 'mt-4' : ''}`}>
          <span className="text-xs font-bold tracking-widest text-[#008080] uppercase px-2 py-1 bg-[#008080]/5 rounded-md">
            {resource.category}
          </span>
        </div>

        <h2 className="font-bold text-lg mb-3 text-gray-900 group-hover:text-[#008080] transition-colors block">
          {resource.title}
        </h2>
        
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap flex-grow">
          {resource.content}
        </p>

        {(resource.createdAt || resource.authorName) && (
          <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center gap-4">
             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
               {resource.authorName || "Anonymous"}
             </span>
             {resource.createdAt && (
               <span className="text-[10px] text-gray-300 font-medium whitespace-nowrap">
                 {new Date(resource.createdAt.seconds * 1000).toLocaleDateString()}
               </span>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
