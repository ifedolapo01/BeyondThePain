"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaUploaderProps {
  onFilesChange: (files: { images: File[]; video: File | null }) => void;
  maxImages?: number;
  maxVideo?: number;
  maxImageSizeMB?: number;
  maxVideoSizeMB?: number;
}

export default function MediaUploader({
  onFilesChange,
  maxImages = 4,
  maxVideo = 1,
  maxImageSizeMB = 5,
  maxVideoSizeMB = 50,
}: MediaUploaderProps) {
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<{ [name: string]: string }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    
    if (!files.length) return;

    let newImages = [...images];
    let newVideo = video;
    let newPreviews = { ...previews };
    let hasError = false;

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > maxImageSizeMB * 1024 * 1024) {
          setError(`Image ${file.name} exceeds ${maxImageSizeMB}MB limit.`);
          hasError = true;
          return;
        }
        if (newImages.length >= maxImages) {
          if (!hasError) setError(`You can only upload up to ${maxImages} images.`);
          hasError = true;
          return;
        }
        
        // Prevent duplicates based on name and size
        if (!newImages.some(i => i.name === file.name && i.size === file.size)) {
            newImages.push(file);
            newPreviews[file.name] = URL.createObjectURL(file);
        }

      } else if (file.type.startsWith("video/")) {
        if (file.size > maxVideoSizeMB * 1024 * 1024) {
          setError(`Video ${file.name} exceeds ${maxVideoSizeMB}MB limit.`);
          hasError = true;
          return;
        }
        if (newVideo) {
          if (!hasError) setError(`You can only upload ${maxVideo} video.`);
          hasError = true;
          return;
        }
        newVideo = file;
        newPreviews[file.name] = URL.createObjectURL(file);
      } else {
        setError(`File type ${file.type} is not supported.`);
        hasError = true;
      }
    });

    setImages(newImages);
    setVideo(newVideo);
    setPreviews(newPreviews);
    onFilesChange({ images: newImages, video: newVideo });
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const fileToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    const newPreviews = { ...previews };
    URL.revokeObjectURL(newPreviews[fileToRemove.name]);
    delete newPreviews[fileToRemove.name];
    setPreviews(newPreviews);
    
    onFilesChange({ images: newImages, video });
  };

  const removeVideo = () => {
    if (video) {
      const newPreviews = { ...previews };
      URL.revokeObjectURL(newPreviews[video.name]);
      delete newPreviews[video.name];
      setPreviews(newPreviews);
    }
    
    setVideo(null);
    onFilesChange({ images, video: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Add Media <span className="text-gray-400 font-normal">(Optional)</span>
        </label>
        <span className="text-xs text-gray-400">
          {images.length}/{maxImages} images, {video ? 1 : 0}/{maxVideo} video
        </span>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-accent transition-colors cursor-pointer group"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 font-medium">Click to upload photos or video</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to {maxImageSizeMB}MB. MP4, WebM up to {maxVideoSizeMB}MB.</p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, video/mp4, video/webm"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {(images.length > 0 || video) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <AnimatePresence>
            {images.map((img, idx) => (
              <motion.div
                key={img.name + idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previews[img.name]} 
                  alt={`Preview ${idx}`} 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}

            {video && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-black group shadow-sm col-span-2 md:col-span-1"
              >
                <video 
                  src={previews[video.name]} 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeVideo(); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 z-10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
