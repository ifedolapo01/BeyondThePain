"use client";

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'admin_last_active';

/**
 * Custom hook to trigger a callback after a period of inactivity.
 * @param timeoutMs - Time in milliseconds before triggering onIdle (default 5 minutes)
 * @param onIdle - Callback function to execute when idle
 * @returns { timeRemaining: number } - Time left in milliseconds
 */
export function useIdleAuth(timeoutMs: number = 300000, onIdle: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(timeoutMs);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onIdleRef = useRef(onIdle);

  // Update ref if onIdle changes
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    const handleIdle = () => {
      onIdleRef.current();
    };

    // Resets the session timer to the full duration
    const resetTimer = () => {
      const now = Date.now().toString();
      localStorage.setItem(STORAGE_KEY, now);
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(handleIdle, timeoutMs);
      setTimeRemaining(timeoutMs);
    };

    // Starts the session timer with a specific remaining duration
    const startTimerWithRemaining = (remaining: number) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(handleIdle, remaining);
      setTimeRemaining(remaining);
    };

    // 1. Initial check when hook mounts
    const checkStatus = () => {
      const lastActive = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      
      if (lastActive) {
        const diff = now - parseInt(lastActive);
        const remaining = Math.max(0, timeoutMs - diff);
        
        if (diff >= timeoutMs) {
          handleIdle();
          return { idle: true, remaining: 0 };
        }
        return { idle: false, remaining };
      }
      return { idle: false, remaining: timeoutMs };
    };

    const status = checkStatus();
    if (status.idle) return;

    // Use existing session time if available, don't reset to 5:00 automatically
    startTimerWithRemaining(status.remaining);

    // 2. Activity Listeners (Only these will reset to 5:00)
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // 3. Visibility Change (Re-check if session expired while away)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentStatus = checkStatus();
        if (currentStatus.idle) {
          handleIdle();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Countdown Tracker (Updates UI and provides safety logout)
    const interval = setInterval(() => {
      const lastActive = localStorage.getItem(STORAGE_KEY);
      if (lastActive) {
        const diff = Date.now() - parseInt(lastActive);
        const remaining = Math.max(0, timeoutMs - diff);
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          handleIdle();
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timeoutMs]);

  return { timeRemaining };
}
