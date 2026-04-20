"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function ImpactDashboard() {
  const [stats, setStats] = useState({
    totalStories: 0,
    totalInsights: 0,
    totalSupport: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const storiesSnap = await getDocs(collection(db, "stories"));
        const resourcesSnap = await getDocs(collection(db, "resources"));
        
        let storyCount = 0;
        let supportCount = 0;

        storiesSnap.forEach((doc) => {
          const data = doc.data();
          storyCount++;
          supportCount += (data.empathyCount || 0) + (data.strengthCount || 0);
        });

        setStats({
          totalStories: storyCount,
          totalInsights: resourcesSnap.size,
          totalSupport: supportCount
        });
      } catch (error) {
        console.error("Error fetching global stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

  if (loading) return null;

  const container = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="bg-accent/5 rounded-3xl p-8 md:p-12 border border-accent/10"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-start">
        <motion.div variants={item} className="flex flex-col items-center">
          <span className="text-4xl md:text-5xl font-black text-accent mb-2">{stats.totalStories}</span>
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Stories Shared</span>
          <p className="text-xs text-gray-400 mt-2 max-w-[150px]">Each journey shared lighting the path for others.</p>
        </motion.div>

        <motion.div variants={item} className="flex flex-col items-center">
          <span className="text-4xl md:text-5xl font-black text-[#008080] mb-2">{stats.totalInsights}</span>
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Insights</span>
          <p className="text-xs text-gray-400 mt-2 max-w-[150px]">Practical advice and community resources.</p>
        </motion.div>
        
        <motion.div variants={item} className="flex flex-col items-center">
          <span className="text-4xl md:text-5xl font-black text-accent mb-2">{stats.totalSupport}</span>
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Acts of Support</span>
          <p className="text-xs text-gray-400 mt-2 max-w-[150px]">Hearts touched and strength shared together.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
