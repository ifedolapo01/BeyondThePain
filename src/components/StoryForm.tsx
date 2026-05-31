"use client";
import { useState } from "react";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import MediaUploader from "@/components/MediaUploader";

export default function StoryForm() {
  const [form, setForm] = useState({
    title: "",
    category: "Patient", // Start with uppercase based on typical frontend mapping or lowercase based on select value mappings
    story: "",
    authorName: "",
    authorAge: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{images: File[], video: File | null}>({ images: [], video: null });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Map form categories to Title Case to match other components
      const categoryMap: Record<string, "Patient" | "Caregiver" | "Observer"> = {
        patient: "Patient",
        caregiver: "Caregiver",
        observer: "Observer"
      };

      const mappedCategory = categoryMap[form.category] || "Patient";
      const snippet = form.story.length > 150 ? form.story.substring(0, 150) + '...' : form.story;
      const finalName = form.authorName.trim() === "" ? "Anonymous" : form.authorName.trim();

      const newDocRef = doc(collection(db, "stories"));

      let mediaUrls: string[] = [];
      let videoUrl: string | null = null;

      if (mediaFiles.images.length > 0) {
        for (const file of mediaFiles.images) {
          const fileRef = ref(storage, `stories/${newDocRef.id}/${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          mediaUrls.push(url);
        }
      }

      if (mediaFiles.video) {
        const videoRef = ref(storage, `stories/${newDocRef.id}/${mediaFiles.video.name}`);
        await uploadBytes(videoRef, mediaFiles.video);
        videoUrl = await getDownloadURL(videoRef);
      }

      await setDoc(newDocRef, {
        title: form.title,
        category: mappedCategory,
        snippet: snippet,
        story: form.story,
        authorName: finalName,
        authorAge: form.authorAge || "Prefer not to say",
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
        videoUrl: videoUrl,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error adding story: ", error);
      alert("There was an error submitting your story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white border border-gray-100 shadow-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You</h2>
        <p className="text-gray-600 mb-6">Your story has been safely received. Your voice matters here.</p>
        <button
          onClick={() => {
            setForm({ title: "", category: "Patient", story: "", authorName: "", authorAge: "" });
            setMediaFiles({ images: [], video: null });
            setSubmitted(false);
          }}
          className="px-6 py-2.5 rounded-full bg-accent text-white hover:bg-accent-hover transition-colors font-medium shadow-sm"
        >
          Share Another Story
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
            placeholder="e.g. Jane Doe or 'Anonymous'"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="authorAge" className="block text-sm font-medium text-gray-700 mb-1">
            Age Range <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <select
            id="authorAge"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none cursor-pointer"
            value={form.authorAge}
            onChange={(e) => setForm({ ...form, authorAge: e.target.value })}
          >
            <option value="">Select Age Range</option>
            <option value="Under 18">Under 18</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45-54">45-54</option>
            <option value="55+">55+</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          placeholder="Give your story a meaningful title"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Perspective
        </label>
        <select
          id="category"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none cursor-pointer"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="patient">I live with it</option>
          <option value="caregiver">I care for someone</option>
          <option value="observer">I&apos;ve experienced it indirectly</option>
        </select>
      </div>

      <div>
        <label htmlFor="story" className="block text-sm font-medium text-gray-700 mb-1">
          Your Story
        </label>
        <textarea
          id="story"
          required
          placeholder="Share what it really feels like..."
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-48 resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
          value={form.story}
          onChange={(e) => setForm({ ...form, story: e.target.value })}
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
        className="w-full py-3.5 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors font-medium text-lg shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit Experience"}
      </button>
    </form>
  );
}
