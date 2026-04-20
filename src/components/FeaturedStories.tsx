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
        // Fetch slightly more to account for archived stories, then take top 3
        const q = query(collection(db, "stories"), orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        const fetchedStories: Story[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status !== 'archived' && fetchedStories.length < 3) {
            fetchedStories.push({
              id: doc.id,
              ...(data as Omit<Story, 'id'>)
            });
          }
        });
        setStories(fetchedStories);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map(story => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}
