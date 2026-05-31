"use client";

import { use, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import ExperienceMode, { StoryPart } from '@/components/ExperienceMode';

export default function StoryExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [parts, setParts] = useState<StoryPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const docRef = doc(db, "stories", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const storyText = data.story || "";
          
          // Split story into readable chunks by punctuation or newlines
          const rawSentences = storyText
            .match(/[^.!?\n]+[.!?\n]*\s*/g)
            ?.map((s: string) => s.trim())
            .filter(Boolean) || [storyText.trim()];
            
          const sentences: string[] = [];
          
          // Further split extremely long chunks (e.g., if user skipped punctuation)
          rawSentences.forEach((sentence: string) => {
            const words = sentence.split(/\s+/);
            if (words.length > 40) {
                for (let i = 0; i < words.length; i += 30) {
                    sentences.push(words.slice(i, i + 30).join(" ") + (i + 30 < words.length ? "..." : ""));
                }
            } else {
                sentences.push(sentence);
            }
          });
            
          let formattedParts: StoryPart[] = [];
          
          // Always add introductory prompt as a standalone part
          formattedParts.push({ text: "", prompt: "Pause. Step into their shoes for a moment." });

          const middleIndex = Math.floor(sentences.length / 2);

          for (let i = 0; i < sentences.length; i++) {
              const chunk = sentences[i].trim();
              if (chunk.length > 0) {
                  let prompt;
                  if (sentences.length >= 2 && i === middleIndex && i > 0) prompt = "Take a breath.";
                  
                  formattedParts.push({ text: chunk, prompt });
              }
          }

          // Fallback if split fails but there's text
          if (formattedParts.length === 0 && storyText.trim()) {
              formattedParts = [{ text: storyText.trim() }];
          }

          setParts(formattedParts);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching story for experience:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
      </div>
    );
  }

  if (notFound || parts.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-4 font-serif">Story Not Found</h1>
        <p className="text-gray-400 mb-8">This experience could not be gathered.</p>
        <Link href={`/stories/${id}`} className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
          Return to Story
        </Link>
      </div>
    );
  }

  return <ExperienceMode parts={parts} storyId={id} />;
}
