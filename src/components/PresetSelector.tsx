import React from 'react';
import { Play, Flame, Zap, Target } from 'lucide-react';
import { Preset, PRESETS } from '../types';

interface PresetSelectorProps {
  onSelectPreset: (preset: Preset) => void;
  stats: { doneCount: number; timeoutCount: number };
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelectPreset, stats }) => {
  const getPresetIcon = (id: string) => {
    switch (id) {
      case '1min':
        return <Zap className="text-amber-400 group-hover:scale-110 transition-transform duration-300" size={24} />;
      case '3min':
        return <Flame className="text-orange-400 group-hover:scale-110 transition-transform duration-300" size={24} />;
      case '5min':
        return <Target className="text-rose-400 group-hover:scale-110 transition-transform duration-300" size={24} />;
      default:
        return <Play className="text-emerald-400" size={24} />;
    }
  };

  const getPresetDescription = (id: string) => {
    switch (id) {
      case '1min':
        return 'Speed drill. For simple MCQs & direct numerical values.';
      case '3min':
        return 'JEE Main pace. For multi-step derivations & equations.';
      case '5min':
        return 'JEE Advanced focus. For complex comprehension passages.';
      default:
        return 'Solve with focus.';
    }
  };

  const getPresetGlow = (id: string) => {
    switch (id) {
      case '1min':
        return 'hover:border-amber-500/50 hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]';
      case '3min':
        return 'hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(249,115,22,0.25)]';
      case '5min':
        return 'hover:border-rose-500/50 hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]';
      default:
        return 'hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center flex-1" id="preset-selector-container">
      {/* Title block */}
      <div className="text-center mb-10 select-none animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight text-white mb-3">
          JEE <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]">QUESTION TIMER</span>
        </h1>
        <p className="text-sm md:text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
          Train your exam speed, optimize pacing, and conquer time-pressure under simulated conditions.
        </p>
      </div>

      {/* Preset Circles Container - Always side-by-side layout, responsive from mobile to tablet */}
      <div className="flex flex-row items-start justify-center gap-3 sm:gap-6 md:gap-10 lg:gap-12 w-full mb-12">
        {PRESETS.map((preset) => (
          <div key={preset.id} className="flex flex-col items-center flex-1 max-w-[150px] sm:max-w-[180px]">
            <button
              onClick={() => onSelectPreset(preset)}
              className={`group relative flex items-center justify-center w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-zinc-950 border-2 border-zinc-850 cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.7)] ${
                preset.id === '1min'
                  ? 'hover:border-amber-500/80 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]'
                  : preset.id === '3min'
                  ? 'hover:border-orange-500/80 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]'
                  : 'hover:border-rose-500/80 hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]'
              }`}
              id={`preset-circle-${preset.id}`}
            >
              {/* Concentric inner glow ring */}
              <div className={`absolute inset-1 sm:inset-1.5 rounded-full border border-dashed transition-all duration-300 ${
                preset.id === '1min'
                  ? 'border-amber-500/10 group-hover:border-amber-500/40 group-hover:scale-95'
                  : preset.id === '3min'
                  ? 'border-orange-500/10 group-hover:border-orange-500/40 group-hover:scale-95'
                  : 'border-rose-500/10 group-hover:border-rose-500/40 group-hover:scale-95'
              }`} />

              {/* Center Content */}
              <div className="flex flex-col items-center justify-center text-center z-10 px-1">
                <span className="mb-0.5 sm:mb-1.5 transform scale-75 sm:scale-100">{getPresetIcon(preset.id)}</span>
                <span className={`text-sm sm:text-xl md:text-2xl font-bold font-mono tracking-tight transition-all duration-300 ${
                  preset.id === '1min'
                    ? 'text-amber-100 group-hover:text-amber-400 group-hover:glow-text-amber'
                    : preset.id === '3min'
                    ? 'text-orange-100 group-hover:text-orange-400'
                    : 'text-rose-100 group-hover:text-rose-400 group-hover:glow-text-rose'
                }`}>
                  {preset.label}
                </span>
                <span className="text-[6px] sm:text-[9px] uppercase tracking-widest text-zinc-500 font-bold mt-0.5">
                  START
                </span>
              </div>
            </button>
            
            {/* Descriptive sub-text below circles */}
            <span className="text-[9px] sm:text-[11px] font-heading font-medium text-zinc-500 mt-3 text-center leading-tight">
              {getPresetDescription(preset.id)}
            </span>
          </div>
        ))}
      </div>

      {/* Tip panel */}
      {stats.doneCount === 0 && stats.timeoutCount === 0 ? (
        <div className="text-center p-4 border border-zinc-800/40 rounded-xl bg-zinc-900/10 max-w-sm select-none">
          <p className="text-[11px] text-zinc-500 italic">
            💡 Tap preset to start. Once running, tap <span className="text-zinc-400 font-medium">anywhere on screen</span> to mark as solved and instantly reset.
          </p>
        </div>
      ) : (
        <div className="text-center p-4 border border-violet-500/10 rounded-xl bg-zinc-900/10 max-w-sm select-none">
          <p className="text-[11px] text-zinc-400">
            📊 Stats preserved below. Ready for your next attempt?
          </p>
        </div>
      )}
    </div>
  );
};
