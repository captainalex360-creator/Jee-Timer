export type TimerStatus = 'idle' | 'running' | 'timeout';

export interface AppStats {
  doneCount: number;      // questions completed early
  timeoutCount: number;   // questions timed out
  sessionSeconds: number; // total elapsed active session time (since first question started)
}

export interface Preset {
  id: string;
  label: string;
  duration: number; // in seconds
}

export const PRESETS: Preset[] = [
  { id: '1min', label: '1 Min', duration: 60 },
  { id: '3min', label: '3 Min', duration: 180 },
  { id: '5min', label: '5 Min', duration: 300 },
];
