"use client";

import { useState, useEffect } from 'react';
import StoryCard from '@/components/StoryCard';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Story {
  id: string;
  title: string;
  category: "Patient" | "Caregiver" | "Observer";
  snippet: string;
}

export default function FeaturedStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        // Fetch recent stories to find the one with the most reactions
        const q = query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(20));
        const querySnapshot = await getDocs(q);
        const allFetched: Story[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'archived') {
            allFetched.push({
              id: doc.id,
              ...(data as Omit<Story, 'id'>)
            });
          }
        });

        // Sort by total reactions (empathy + strength)
        allFetched.sort((a: any, b: any) => {
          const aReactions = (a.empathyCount || 0) + (a.strengthCount || 0);
          const bReactions = (b.empathyCount || 0) + (b.strengthCount || 0);
          return bReactions - aReactions;
        });

        const topStories = allFetched.slice(0, 1);
        console.log("Rendered Story of the week (should be 1):", topStories);
        setStories(topStories);
      } catch (error) {
        console.error("Error fetching featured stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No stories shared yet. Be the first!
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full text-left">
        {stories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
