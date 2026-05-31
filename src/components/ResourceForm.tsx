"use client";

import { useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import MediaUploader from "@/components/MediaUploader";
import { motion } from "framer-motion";

type Category = 'Treatment' | 'Hospital' | 'Lifestyle' | 'General';
type Sentiment = 'Recommended' | 'Wary';

export default function ResourceForm() {
  const [form, setForm] = useState({
    title: "",
    category: "General" as Category,
    sentiment: "Recommended" as Sentiment,
    content: "",
    authorName: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{images: File[], video: File | null}>({ images: [], video: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const finalName = form.authorName.trim() === "" ? "Anonymous" : form.authorName.trim();

      const newDocRef = doc(collection(db, "resources"));

      let mediaUrls: string[] = [];
      let videoUrl: string | null = null;

      if (mediaFiles.images.length > 0) {
        for (const file of mediaFiles.images) {
          const fileRef = ref(storage, `resources/${newDocRef.id}/${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          mediaUrls.push(url);
        }
      }

      if (mediaFiles.video) {
        const videoRef = ref(storage, `resources/${newDocRef.id}/${mediaFiles.video.name}`);
        await uploadBytes(videoRef, mediaFiles.video);
        videoUrl = await getDownloadURL(videoRef);
      }

      await setDoc(newDocRef, {
        title: form.title,
        category: form.category,
        sentiment: form.category === 'Hospital' ? form.sentiment : null,
        content: form.content,
        authorName: finalName,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
        videoUrl: videoUrl,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error adding resource: ", error);
      alert("There was an error submitting your recommendation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-[#008080]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✨</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You</h2>
        <p className="text-gray-600 mb-6">Your recommendation has been shared with the community. Knowledge is power.</p>
        <button
          onClick={() => {
            setForm({ title: "", category: "General", sentiment: "Recommended", content: "", authorName: "" });
            setMediaFiles({ images: [], video: null });
            setSubmitted(false);
          }}
          className="px-6 py-2.5 rounded-full bg-[#008080] text-white hover:bg-[#006666] transition-colors font-medium shadow-sm"
        >
          Share Something Else
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      {/* Community Safety Note */}
      <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-start gap-3 text-left">
        <span className="text-amber-600 text-lg leading-none mt-0.5">⚠️</span>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-950">Community Safety Note</h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            Please be mindful and careful of what you share. To keep this a supportive and healing space, do not post any demeaning, insulting, or disrespectful messages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            id="authorName"
            type="text"
            placeholder="e.g. Jane Doe"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] outline-none transition-all"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] outline-none transition-all appearance-none cursor-pointer"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
          >
            <option value="General">General Advice</option>
            <option value="Treatment">Treatment/Medicine</option>
            <option value="Lifestyle">Lifestyle/Tips</option>
            <option value="Hospital">Hospital/Provider</option>
          </select>
        </div>
      </div>

      {form.category === 'Hospital' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[#008080]/5 rounded-xl border border-[#008080]/10"
        >
          <label className="block text-sm font-semibold text-[#008080] mb-3">Recommendation Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, sentiment: 'Recommended' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                form.sentiment === 'Recommended' 
                  ? 'bg-[#008080] text-white shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Recommended 👍
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, sentiment: 'Wary' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                form.sentiment === 'Wary' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              Be Wary ⚠️
            </button>
          </div>
        </motion.div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Post Title
        </label>
        <input
          id="title"
          type="text"
          required
          placeholder="e.g. This tea helped with my joint pain"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] outline-none transition-all"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Details
        </label>
        <textarea
          id="content"
          required
          placeholder="Share specifically what worked or why to be cautious..."
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-40 resize-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] outline-none transition-all"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </div>

      <MediaUploader 
        onFilesChange={(files) => setMediaFiles(files)} 
        maxImages={4}
        maxVideo={1}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl bg-[#008080] text-white hover:bg-[#006666] transition-colors font-medium text-lg shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sharing..." : "Post to Knowledge Hub"}
      </button>
    </form>
  );
}
