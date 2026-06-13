/**
 * Plays an alarm consisting of 3 separate beeps at 880Hz
 * using the Web Audio API. Smooth envelopes are added 
 * to eliminate clicks or audio pops.
 */
export function playAlarm(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API is not supported in this browser.');
      return;
    }
    
    const ctx = new AudioContextClass();
    const startTime = ctx.currentTime;
    const beepDuration = 0.18; // duration of beep in seconds
    const gap = 0.12;          // gap between beeps in seconds
    
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, startTime + i * (beepDuration + gap));
      
      const beepStart = startTime + i * (beepDuration + gap);
      const beepEnd = beepStart + beepDuration;
      
      // Volume envelope: rise quickly, hold, decay quickly
      gain.gain.setValueAtTime(0, beepStart);
      gain.gain.linearRampToValueAtTime(0.4, beepStart + 0.02);
      gain.gain.setValueAtTime(0.4, beepEnd - 0.02);
      gain.gain.linearRampToValueAtTime(0, beepEnd);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(beepStart);
      osc.stop(beepEnd);
    }
  } catch (err) {
    console.error('Failed to play synthesized alarm:', err);
  }
}
