import React from 'react';
import { Square, TrendingUp, HelpCircle } from 'lucide-react';

interface StopButtonWidgetProps {
  onStop: () => void;
  doneCount: number;
  timeoutCount: number;
  sessionSeconds: number;
}

export const StopButtonWidget: React.FC<StopButtonWidgetProps> = ({
  onStop,
  doneCount,
  timeoutCount,
  sessionSeconds,
}) => {
  const attempts = doneCount + timeoutCount;

  // Calculate live session average: Q/min
  const calculateAverage = (): string => {
    if (sessionSeconds <= 0) return '0.0';
    const minutes = sessionSeconds / 60;
    const avg = doneCount / minutes;
    return avg.toFixed(1);
  };

  return (
    <div 
      className="absolute sm:fixed left-2.5 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4 py-5 px-3 rounded-2xl bg-zinc-950/85 border border-zinc-800/80 shadow-[0_0_35px_rgba(0,0,0,0.9)] backdrop-blur-xl max-w-[110px] sm:max-w-[130px] select-none text-center"
      id="left-stop-widget"
      onClick={(e) => e.stopPropagation()} // Stop propagation so it doesn't solve a question when clicked!
    >
      {/* Mini Stats inside Widget */}
      <div className="flex flex-col gap-3 w-full border-b border-zinc-900 pb-4">
        {/* Questions Attempted Block */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[9px] font-heading font-semibold text-zinc-500 uppercase tracking-widest leading-none mb-1">
            <HelpCircle size={10} className="text-zinc-500" />
            <span>Attempted</span>
          </div>
          <span className="text-base sm:text-lg font-mono font-bold text-zinc-200">
            {attempts}
          </span>
        </div>

        {/* Live average rates */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 text-[9px] font-heading font-semibold text-zinc-500 uppercase tracking-widest leading-none mb-1">
            <TrendingUp size={10} className="text-zinc-500" />
            <span>Avg Rate</span>
          </div>
          <span className="text-xs sm:text-sm font-mono font-bold text-zinc-300">
            {calculateAverage()} <span className="text-[8px] text-zinc-500 font-normal">/m</span>
          </span>
        </div>
      </div>

      {/* Big Glowing Stop Button */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onStop}
          className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-950/20 border-2 border-rose-500/80 hover:bg-rose-500 hover:border-rose-400 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.35)] hover:shadow-[0_0_30px_rgba(244,63,94,0.7)] active:scale-95"
          title="Stop Timer"
          id="widget-btn-stop"
        >
          <Square className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 group-hover:text-zinc-950 group-hover:fill-current fill-current transition-colors duration-200" />
        </button>
        <span className="text-[9px] font-heading font-bold text-rose-500/80 uppercase tracking-widest mt-1 group-hover:text-rose-400">
          STOP
        </span>
      </div>
    </div>
  );
};
