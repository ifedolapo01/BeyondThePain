"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export type StoryPart = {
  text: string;
  prompt?: string;
};

type Props = {
  parts: StoryPart[];
  storyId: string;
};

// Generative Web Audio Synthesizer (Zero network requests, naturally emotional, uncopyrighted)
function useGenerativeAmbient(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume().catch(console.error);

    // E-minor pentatonic scale (very melancholic/reflective)
    const frequencies = [
      164.81, // E3
      196.00, // G3
      220.00, // A3
      246.94, // B3
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00  // A4
    ];
    
    const timeoutIds: NodeJS.Timeout[] = [];
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);

    const playNote = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine'; // Soft, pure tone resembling a soft bell or glass
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      // Extremely slow attack and long decay for an atmospheric "floating" sound
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 3);  // 3s fade in
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 10); // 7s fade out
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 11);

      // Play next note between 2 and 5 seconds later
      const nextDelay = 2000 + Math.random() * 3000;
      timeoutIds.push(setTimeout(playNote, nextDelay));
    };

    // Start overlapping notes to create a rich harmony
    playNote();
    setTimeout(playNote, 1500);
    setTimeout(playNote, 3500);

    return () => {
      timeoutIds.forEach(clearTimeout);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => ctx.close().catch(() => {}), 1000);
    };
  }, [enabled]);
}

export default function ExperienceMode({ parts, storyId }: Props) {
  const [step, setStep] = useState(0);
  const part = parts[step];

  // Initiate generative music immediately
  useGenerativeAmbient(step < parts.length);

  // Auto-advance pacing: Wait 5 seconds and then advance automatically
  useEffect(() => {
    if (step < parts.length) {
       const timer = setTimeout(() => {
           setStep(s => s + 1);
       }, 5000);
       return () => clearTimeout(timer);
    }
  }, [step, parts.length]);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center p-6 selection:bg-accent selection:text-white h-screen w-screen overflow-hidden">
      <div className="max-w-2xl w-full text-center flex flex-col items-center">
        
        {/* Top Controls */}
        <div className="absolute top-8 w-full px-8 flex justify-between items-center max-w-7xl">
            <Link 
              href={`/stories/${storyId}`} 
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors tracking-wide flex items-center gap-2"
            >
              &larr; Exit Experience
            </Link>
        </div>

        {/* Content Area */}
        <div className="flex flex-col items-center justify-center w-full min-h-[300px]">
          <AnimatePresence mode="wait">
            {step < parts.length && (
              <motion.div
                key={`part-${step}`}
                className="flex flex-col items-center justify-center w-full"
                initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)", y: -10 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {/* Prompt */}
                {part?.prompt && (
                  <div className={`font-serif italic text-accent/80 transition-all ${(!part?.text || part.text.length === 0) ? "text-2xl md:text-3xl font-light mb-0" : "text-lg mb-8"}`}>
                    {part.prompt}
                  </div>
                )}

                {/* Text Area */}
                {part?.text && part.text.length > 0 && (
                  <div className="text-xl md:text-2xl leading-relaxed md:leading-loose font-serif font-light opacity-90 w-full">
                    {part.text}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress & Controls */}
        <div className="mt-8 h-32 flex flex-col items-center justify-start w-full">
          {step < parts.length ? (
            <p className="text-xs text-gray-700 tracking-[0.2em] uppercase mb-8">
              {step + 1} / {parts.length}
            </p>
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ duration: 1.5, delay: 0.5 }}
               className="flex flex-col items-center"
            >
              <p className="text-gray-400 font-serif italic mb-8 text-lg">
                What stayed with you from this experience?
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(0)}
                  className="px-8 py-3 rounded-full border border-gray-600 text-gray-200 hover:bg-gray-800 transition-colors text-sm tracking-wide"
                >
                  Start Again
                </button>
                <Link 
                  href={`/stories/${storyId}#comments`}
                  className="px-8 py-3 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors text-sm tracking-wide shadow-lg shadow-accent/20"
                >
                  Comment
                </Link>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
