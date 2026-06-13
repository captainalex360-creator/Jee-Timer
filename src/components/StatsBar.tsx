import React from 'react';
import { CheckCircle2, Clock, Activity, AlertCircle } from 'lucide-react';
import { AppStats } from '../types';

interface StatsBarProps {
  stats: AppStats;
  isSessionActive: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, isSessionActive }) => {
  const { doneCount, timeoutCount, sessionSeconds } = stats;

  // Format active session time (MM:SS or HH:MM:SS)
  const formatSessionTime = (totalSecs: number): string => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Live average calculation: Done questions completed per minutes of active session.
  // To keep it simple and clean, if no time has passed yet but a question was marked done, 
  // we count the fractional rate correctly, or show 0.0 before any active seconds.
  const calculateAverage = (): string => {
    if (sessionSeconds <= 0) return '0.0';
    const minutes = sessionSeconds / 60;
    const avg = doneCount / minutes;
    return avg.toFixed(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-4 pb-2" id="stats-bar-container">
      <div className="grid grid-cols-4 gap-2 md:gap-4 bg-zinc-950/80 border border-zinc-800/60 p-2 md:p-3 rounded-2xl relative overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        {/* Subtle background glow for the active stats panel */}
        <div className="absolute inset-0 pointer-events-none glow-ambient-violet opacity-40" />

        {/* DONE TAB */}
        <div 
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 transition-all duration-300 hover:border-emerald-500/30"
          id="stat-done"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 size={13} className="text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] md:text-xs font-heading font-semibold text-zinc-400 tracking-wider uppercase">Done</span>
          </div>
          <span className="text-xl md:text-2xl font-mono font-bold text-emerald-400 glow-text-emerald">
            {doneCount}
          </span>
          <span className="text-[9px] text-zinc-500 mt-0.5 whitespace-nowrap">Completed</span>
        </div>

        {/* SESSION TAB */}
        <div 
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 transition-all duration-300 hover:border-violet-500/30"
          id="stat-session"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock size={13} className="text-violet-400 drop-shadow-[0_0_4px_rgba(139,92,246,0.5)] animate-pulse" />
            <span className="text-[10px] md:text-xs font-heading font-semibold text-zinc-400 tracking-wider uppercase">Session</span>
          </div>
          <span className="text-xl md:text-2xl font-mono font-bold text-violet-400 glow-text-violet">
            {formatSessionTime(sessionSeconds)}
          </span>
          <span className="text-[9px] text-zinc-500 mt-0.5 whitespace-nowrap">
            {isSessionActive ? 'Active' : 'Paused'}
          </span>
        </div>

        {/* AVG TAB */}
        <div 
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 transition-all duration-300 hover:border-amber-500/30"
          id="stat-avg"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Activity size={13} className="text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] md:text-xs font-heading font-semibold text-zinc-400 tracking-wider uppercase">Avg</span>
          </div>
          <span className="text-xl md:text-2xl font-mono font-bold text-amber-400 glow-text-amber">
            {calculateAverage()}
          </span>
          <span className="text-[9px] text-zinc-500 mt-0.5 whitespace-nowrap">Q/Min</span>
        </div>

        {/* TIMEOUT TAB */}
        <div 
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/40 transition-all duration-300 hover:border-rose-500/30"
          id="stat-timeout"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertCircle size={13} className="text-rose-400 drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]" />
            <span className="text-[10px] md:text-xs font-heading font-semibold text-zinc-400 tracking-wider uppercase">T/O</span>
          </div>
          <span className="text-xl md:text-2xl font-mono font-bold text-rose-400 glow-text-rose">
            {timeoutCount}
          </span>
          <span className="text-[9px] text-zinc-500 mt-0.5 whitespace-nowrap">Limit Out</span>
        </div>
      </div>
    </div>
  );
};
