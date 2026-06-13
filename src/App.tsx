import { useState, useEffect, useRef } from 'react';
import { StatsBar } from './components/StatsBar';
import { PresetSelector } from './components/PresetSelector';
import { CountdownDisplay } from './components/CountdownDisplay';
import { StopButtonWidget } from './components/StopButtonWidget';
import { playAlarm } from './utils/audio';
import { Preset, AppStats, TimerStatus } from './types';

export default function App() {
  // Timer state managers
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [flash, setFlash] = useState<'tap-green' | 'tap-amber' | 'tap-red' | 'timeout' | null>(null);

  // Overall session statistics
  const [stats, setStats] = useState<AppStats>(() => {
    // Attempt local restoring in case of minor refreshes, fitting user instructions
    try {
      const saved = sessionStorage.getItem('jee_timer_stats');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignored
    }
    return {
      doneCount: 0,
      timeoutCount: 0,
      sessionSeconds: 0,
    };
  });

  // Keep stats synchronized to sessionStorage to survive brief context pauses
  useEffect(() => {
    try {
      sessionStorage.setItem('jee_timer_stats', JSON.stringify(stats));
    } catch {
      // Ignored
    }
  }, [stats]);

  // Timing references
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const timeoutResetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);

  // Active session clock ticking since first solved or started question
  useEffect(() => {
    // If stats loaded from sessionStorage has total active past seconds, restore start point
    if (stats.sessionSeconds > 0 && !sessionStartRef.current) {
      sessionStartRef.current = Date.now() - stats.sessionSeconds * 1000;
    }

    const sessionTick = setInterval(() => {
      if (sessionStartRef.current) {
        const totalElapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        setStats((prev) => ({
          ...prev,
          sessionSeconds: totalElapsed,
        }));
      }
    }, 500);

    return () => clearInterval(sessionTick);
  }, [stats.sessionSeconds > 0]);

  // Active question timer countdown interval
  useEffect(() => {
    if (status !== 'running' || !currentPreset) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaSecs = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      setTimeLeft((prev) => {
        const remaining = prev - deltaSecs;
        if (remaining <= 0) {
          triggerTimeout();
          return 0;
        }
        return remaining;
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [status, currentPreset]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timeoutResetTimeoutRef.current) clearTimeout(timeoutResetTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  // Set preset and initialize/activate the timer
  const handleSelectPreset = (preset: Preset) => {
    // Initiate session timer once on very first launch
    if (!sessionStartRef.current) {
      sessionStartRef.current = Date.now();
    }

    // Cancel any previous alert state or timeout screen lock
    if (timeoutResetTimeoutRef.current) {
      clearTimeout(timeoutResetTimeoutRef.current);
      timeoutResetTimeoutRef.current = null;
    }
    setFlash(null);

    setCurrentPreset(preset);
    setTimeLeft(preset.duration);
    setStatus('running');
  };

  // Full-screen tap handler when a question is solved early
  const handleScreenTap = () => {
    if (status !== 'running' || !currentPreset) return;

    // Increment completed "Done" count
    setStats((prev) => ({
      ...prev,
      doneCount: prev.doneCount + 1,
    }));

    // Calculate active flash class corresponding to the remaining percentage
    const percent = timeLeft / currentPreset.duration;
    let tapColor: 'tap-green' | 'tap-amber' | 'tap-red' = 'tap-green';
    
    if (percent >= 0.5) {
      tapColor = 'tap-green';
    } else if (percent >= 0.2) {
      tapColor = 'tap-amber';
    } else {
      tapColor = 'tap-red';
    }

    // Trigger instant rapid color matching flash
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    setFlash(tapColor);
    
    flashTimeoutRef.current = setTimeout(() => {
      setFlash(null);
    }, 350);

    // Instantly reset the exact timer back to full duration with ZERO delay or intermediate screen
    setTimeLeft(currentPreset.duration);
    lastTickRef.current = Date.now();
  };

  // Force stop current workout
  const handleStop = () => {
    // Clear dynamic countdown timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (timeoutResetTimeoutRef.current) {
      clearTimeout(timeoutResetTimeoutRef.current);
      timeoutResetTimeoutRef.current = null;
    }

    // Reset components to idle selection state
    setStatus('idle');
    setCurrentPreset(null);
    setTimeLeft(0);
    setFlash(null);
  };

  // Handles countdown expiration
  const triggerTimeout = () => {
    setStatus('timeout');
    setStats((prev) => ({
      ...prev,
      timeoutCount: prev.timeoutCount + 1,
    }));

    // Start strong red screen timeout alert
    setFlash('timeout');

    // Synthesize alarm audio using the Web Audio API
    playAlarm();

    // Reset back to preset selection screen after 2.5 seconds
    if (timeoutResetTimeoutRef.current) clearTimeout(timeoutResetTimeoutRef.current);
    timeoutResetTimeoutRef.current = setTimeout(() => {
      setStatus('idle');
      setCurrentPreset(null);
      setFlash(null);
    }, 2500);
  };

  return (
    <div 
      className={`min-h-screen w-full bg-[#050507] text-zinc-100 flex flex-col justify-between relative overflow-hidden transition-all duration-300 select-none ${
        flash === 'tap-green' ? 'flash-tap-green-active' :
        flash === 'tap-amber' ? 'flash-tap-amber-active' :
        flash === 'tap-red' ? 'flash-tap-red-active' :
        flash === 'timeout' ? 'flash-timeout-active' : ''
      }`}
      onClick={handleScreenTap}
      id="app-full-interactive-screen"
    >
      {/* Background Starry Accent / Tech Frame border */}
      <div className="absolute inset-0 pointer-events-none border border-zinc-900/30 m-4 rounded-[40px] z-10" />

      {/* Persistent Stats Bar on Top */}
      <StatsBar 
        stats={stats} 
        isSessionActive={sessionStartRef.current !== null && status === 'running'} 
      />

      {/* Main Panel Frame: switches between selector and timer */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-5xl mx-auto relative px-2 pr-4 sm:px-12 z-20">
        
        {/* Absolute Glowing Stop Button On Left Side (Only when timer is active) */}
        {status !== 'idle' && currentPreset && (
          <StopButtonWidget
            onStop={handleStop}
            doneCount={stats.doneCount}
            timeoutCount={stats.timeoutCount}
            sessionSeconds={stats.sessionSeconds}
          />
        )}

        {status === 'idle' ? (
          <PresetSelector 
            onSelectPreset={handleSelectPreset} 
            stats={stats}
          />
        ) : (
          <CountdownDisplay
            timeLeft={timeLeft}
            duration={currentPreset?.duration || 60}
            status={status}
            currentPresetId={currentPreset?.id || '1min'}
            onSelectPreset={handleSelectPreset}
            attemptsCount={stats.doneCount + stats.timeoutCount}
          />
        )}
      </div>

      {/* Small Tech Credit line */}
      <div className="w-full text-center py-4 z-20 select-none opacity-40">
        <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-600">
          JEE PREP CORE UNIT
        </span>
      </div>
    </div>
  );
}
