"use client";

import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export default function CommentSection({ storyId }: { storyId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storyId) return;

    const commentsRef = collection(db, "stories", storyId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(comment => comment.status !== 'archived') as Comment[];
      setComments(fetchedComments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentsRef = collection(db, "stories", storyId, "comments");
      await addDoc(commentsRef, {
        authorName: authorName.trim() || "Anonymous",
        content: newComment.trim(),
        createdAt: serverTimestamp(),
      });
      setNewComment("");
      setAuthorName("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 space-y-12">
      <div className="border-t border-gray-100 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Helping Comments</h2>
            <p className="text-gray-500 mt-1">Share a word of encouragement or a similar experience.</p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/submit" 
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent/5 text-accent hover:bg-accent hover:text-white transition-all font-semibold text-sm border border-accent/10"
            >
              <span>Moved to share your story?</span>
              <span className="text-lg">✨</span>
            </Link>
          </motion.div>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mb-10">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
            <textarea
              placeholder="Write a supportive comment..."
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl h-24 resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-sm"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-6 py-2.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-all font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent/20"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No comments yet. Be the first to offer support.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {comment.authorName}
                    </span>
                    {comment.createdAt && (
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                        {new Date(comment.createdAt.seconds * 1000).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      
      {/* Footer CTA */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="bg-gradient-to-br from-accent/5 to-transparent p-8 rounded-3xl border border-accent/10 text-center"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-3">Your voice matters too</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          If this story resonated with you, consider sharing your own experience. Your words could be the light someone else needs today.
        </p>
        <Link 
          href="/submit"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-white hover:bg-accent-hover transition-all font-bold shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-95"
        >
          Share Your Journey
        </Link>
      </motion.div>
    </div>
  );
}
