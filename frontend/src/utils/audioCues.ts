/**
 * Web Audio API synthesized accessible sound cues.
 * Provides subtle, pleasant auditory feedback for assistive interactions
 * without requiring external sound files or internet connectivity.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Soft affirmative chime (e.g., when sending an AAC phrase or reaction)
   */
  playChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio cue failed:', e);
    }
  }

  /**
   * Positive success chime (e.g., teacher acknowledged question, lesson published)
   */
  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [
        { freq: 440, time: 0 },      // A4
        { freq: 554.37, time: 0.08 }, // C#5
        { freq: 659.25, time: 0.16 }  // E5
      ].forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.1, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + 0.36);
      });
    } catch (e) {
      console.warn('Audio cue failed:', e);
    }
  }

  /**
   * Gentle pop sound (e.g. toggles, reactions)
   */
  playPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.06);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      console.warn('Audio cue failed:', e);
    }
  }

  /**
   * Notification alert chime (e.g., urgent announcement or check-in poll)
   */
  playAlert() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {
      console.warn('Audio cue failed:', e);
    }
  }
}

export const soundSynth = new SoundSynthesizer();

export function playAudioCue(type: 'chime' | 'success' | 'pop' | 'alert') {
  const soundEnabled = localStorage.getItem('setu_pref_sound_effects') !== 'false';
  if (!soundEnabled) return;

  switch (type) {
    case 'chime':
      soundSynth.playChime();
      break;
    case 'success':
      soundSynth.playSuccess();
      break;
    case 'pop':
      soundSynth.playPop();
      break;
    case 'alert':
      soundSynth.playAlert();
      break;
  }
}
