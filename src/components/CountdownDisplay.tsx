import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { Preset, PRESETS, TimerStatus } from '../types';

interface CountdownDisplayProps {
  timeLeft: number;
  duration: number;
  status: TimerStatus;
  currentPresetId: string;
  onSelectPreset: (preset: Preset) => void;
  attemptsCount: number;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({
  timeLeft,
  duration,
  status,
  currentPresetId,
  onSelectPreset,
  attemptsCount,
}) => {
  // Calculate percent remaining
  const percent = Math.max(0, Math.min(1, timeLeft / duration));
  
  // Decide active colors and glows based on state and remaining percentage
  const isTimeout = status === 'timeout';
  
  const getTimerColors = () => {
    if (isTimeout) {
      return {
        textClass: 'text-rose-500 glow-text-rose-lg',
        strokeColor: '#f43f5e',
        glowClass: 'drop-shadow-glow-red',
        bulletColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      };
    }
    
    if (percent >= 0.5) {
      return {
        textClass: 'text-emerald-400 glow-text-emerald-lg',
        strokeColor: '#10b981',
        glowClass: 'drop-shadow-glow-green',
        bulletColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      };
    } else if (percent >= 0.2) {
      return {
        textClass: 'text-amber-400 glow-text-amber-lg',
        strokeColor: '#f59e0b',
        glowClass: 'drop-shadow-glow-amber',
        bulletColor: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      };
    } else {
      return {
        textClass: 'text-rose-400 glow-text-rose-lg',
        strokeColor: '#f43f5e',
        glowClass: 'drop-shadow-glow-red',
        bulletColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
      };
    }
  };

  const { textClass, strokeColor, glowClass, bulletColor } = getTimerColors();

  // SVG Circular progress dimensions
  const center = 150;
  const radius = 124;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent * circumference);

  // Format MM:SS with leading zeroes
  const formatTimerNumber = (totalSecs: number): string => {
    const ceilSecs = Math.ceil(totalSecs);
    const m = Math.floor(ceilSecs / 60);
    const s = ceilSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine if we've elapsed 2+ seconds in the current question
  const elapsedSeconds = duration - timeLeft;
  const showTapHint = status === 'running' && elapsedSeconds >= 2;

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full select-none py-4 px-6 relative" id="countdown-display-wrapper">
      
      {/* Outer Glow Overlay */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out ${
        isTimeout ? 'glow-ambient-red opacity-100' :
        percent >= 0.5 ? 'glow-ambient-green opacity-40' :
        percent >= 0.2 ? 'glow-ambient-amber opacity-40' :
        'glow-ambient-red opacity-80'
      }`} />

      {/* Main Timer Core */}
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        id="timer-interactive-circle"
      >
        <div className={`relative flex items-center justify-center w-[300px] h-[300px] rounded-full transition-all duration-300 ${isTimeout ? 'shake-active' : ''}`}>
          
          {/* Circular Progress Arc Layer */}
          <svg width={300} height={300} className="absolute inset-0 transform -rotate-90">
            {/* Background Trace Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#0f0f13"
              strokeWidth={strokeWidth}
            />
            {/* Active Depleting Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-100 ease-linear ${glowClass}`}
            />
          </svg>

          {/* Center Text Panel */}
          <div className="flex flex-col items-center justify-center z-15 text-center px-6">
            {/* Top Indicator */}
            <div className="flex items-center gap-1.5 mb-1 bg-zinc-950/90 py-1 px-3 border border-zinc-800/60 rounded-full">
              <span className={`w-1.5 h-1.5 rounded-full ${bulletColor} transition-all duration-300`} />
              <span className="text-[10px] font-heading font-medium tracking-widest text-zinc-400 uppercase">
                {isTimeout ? 'Timeout' : `Solving Q${attemptsCount + 1}`}
              </span>
            </div>

            {/* Large Number representation */}
            <div 
              className={`text-5xl md:text-6xl font-mono font-black tracking-tight select-none transition-all duration-300 ${textClass} ${status === 'running' ? 'pulse-active' : ''}`}
            >
              {isTimeout ? '00:00' : formatTimerNumber(timeLeft)}
            </div>

            {/* Small status indicator */}
            <div className="mt-2 text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold h-4">
              {status === 'running' ? (
                <span>active countdown</span>
              ) : (
                <span className="text-rose-500 glow-text-rose animate-pulse">beep! beep! beep!</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tap anywhere Hint - Framer Motion fading absolute hint */}
      <div className="h-10 mt-6 z-10 flex items-center justify-center">
        <AnimatePresence>
          {showTapHint ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 py-1 px-4 bg-zinc-900/60 border border-zinc-800/40 rounded-full backdrop-blur-md"
            >
              <span className="text-[11px] text-zinc-400 font-medium font-heading tracking-wider flex items-center gap-1">
                Tap anywhere to finish early
                <ChevronRight className="w-3.5 h-3.5 inline text-emerald-400 animate-pulse" />
              </span>
            </motion.div>
          ) : isTimeout ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-1 px-4 rounded-full bg-rose-950/40 border border-rose-900/40 select-none"
            >
              <span className="text-xs text-rose-300 font-heading font-bold uppercase tracking-wider animate-pulse">
                Auto-resetting soon...
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Floating Bottom Pill presets (Tapping switches the duration mid-session) */}
      <div className="mt-8 z-10 px-4" id="floating-pill-presets">
        <div className="flex items-center gap-1 bg-zinc-950/90 border border-zinc-800/70 p-1.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <span className="text-[9px] font-mono font-medium tracking-wider text-zinc-500 px-3 uppercase select-none hidden sm:inline-block border-r border-zinc-900 leading-none">
            Preset
          </span>
          {PRESETS.map((p) => {
            const isActive = currentPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering full screen tap!
                  onSelectPreset(p);
                }}
                className={`py-1.5 px-4 rounded-full font-heading font-semibold text-xs transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950 shadow-[0_0_12px_rgba(255,255,255,0.25)] font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
                id={`floating-preset-${p.id}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
