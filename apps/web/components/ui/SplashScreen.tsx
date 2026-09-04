'use client';

import { useState, useEffect } from 'react';
import { HeartPulse, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Check if splash has already shown in this session
    const hasShown = sessionStorage.getItem('smartcare_splash_shown');
    if (hasShown) {
      setVisible(false);
      return;
    }

    // Animate progress smoothly
    const t1 = setTimeout(() => setProgress(45), 200);
    const t2 = setTimeout(() => setProgress(85), 500);
    const t3 = setTimeout(() => setProgress(100), 750);

    const fadeTimer = setTimeout(() => {
      setFading(true);
      sessionStorage.setItem('smartcare_splash_shown', 'true');
    }, 900);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-label="Loading SmartCare Platform"
      role="status"
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center',
        'bg-gradient-to-b from-[#0a1828] via-[#0d223a] to-[#08121e] text-white',
        'transition-all duration-500 ease-out',
        fading ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      )}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute w-96 h-96 rounded-full bg-teal-500/15 blur-3xl -top-20 -left-20 pointer-events-none animate-pulse" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-600/10 blur-3xl -bottom-20 -right-20 pointer-events-none animate-pulse delay-700" />

      {/* Main mark container */}
      <div className="relative flex flex-col items-center text-center px-6 max-w-sm z-10">
        {/* Pulsing beacon & icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-2xl bg-teal-400/20 blur-xl animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-700 p-0.5 shadow-2xl shadow-teal-500/30">
            <div className="w-full h-full rounded-[14px] bg-[#0c1e33] flex items-center justify-center text-teal-400">
              <HeartPulse size={42} className="animate-pulse" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0c1e33]" />
          </span>
        </div>

        {/* Wordmark */}
        <div className="flex items-center gap-1.5 mb-2">
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-teal-300">
            SmartCare
          </h1>
          <Sparkles size={16} className="text-teal-400 animate-bounce" />
        </div>

        <p className="text-sm font-medium text-teal-200/70 mb-8 max-w-xs">
          Care access, clearly organized.
        </p>

        {/* High-tech Progress bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 p-0.5 backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(45,212,191,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live system state text */}
        <div className="flex items-center gap-2 text-[11px] text-teal-300/60 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
          <span>Synchronizing care network...</span>
        </div>
      </div>
    </div>
  );
}
