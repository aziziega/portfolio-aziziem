// Web Audio API Synthesizer for Subtle Tactile Micro-Interactions
// Pure browser-synthesized audio: zero external downloads, zero latency, zero CORS/network issues.

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    this.isMuted = false;
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isMuted));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_sound_muted", String(this.isMuted));
    }
    this.notify();
    if (!this.isMuted) {
      this.playClick(1.1);
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio_sound_muted", String(muted));
    }
    this.notify();
  }

  // Soft mechanical tactile click (like a dampened Cherry MX switch or Apple haptic tap)
  public playClick(pitch: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400 * pitch, t);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(560 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(130 * pitch, t + 0.022);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.025);
    } catch {
      // Ignore audio synthesis errors silently
    }
  }

  // Soft tactile hover tick
  public playHover() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.012);

      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.015);
    } catch {
      // Ignore
    }
  }

  // Smooth pop when opening terminal / dialog
  public playPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(620, t + 0.035);

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch {
      // Ignore
    }
  }

  // Descending blip when closing modal
  public playClose() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(540, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.035);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.045);
    } catch {
      // Ignore
    }
  }

  // Organic mechanical keystroke sound for typing in the terminal
  public playKeystroke() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const randomPitch = 480 + (Math.random() * 100 - 50);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(randomPitch, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.018);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.02);
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new SoundManager();

// Automatically attach subtle tactile click to interactive elements across the website
if (typeof window !== "undefined" && typeof document !== "undefined") {
  let lastClick = 0;
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("a, button, [role='button'], .techstack-item, .contact-social, .traffic-btn");
      if (interactive) {
        const now = performance.now();
        if (now - lastClick > 40) {
          lastClick = now;
          soundFx.playClick();
        }
      }
    },
    { capture: true, passive: true }
  );
}
