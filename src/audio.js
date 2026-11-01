/**
 * Retro 8-bit Procedural Web Audio Synthesizer.
 * Generates sound effects dynamically without external audio files.
 */
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('shadow_crawl_muted') === 'true';
    this.setupAutoUnlock();
  }

  setupAutoUnlock() {
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    localStorage.setItem('shadow_crawl_muted', this.muted);
    if (!this.muted) {
      this.playTestBeep();
    }
    return this.muted;
  }

  playTestBeep() {
    this.playTone(440, 'square', 0.1, 0.2);
    setTimeout(() => this.playTone(880, 'square', 0.15, 0.2), 100);
  }

  playTone(freq, type = 'square', duration = 0.12, gainVal = 0.2) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') {
      if (this.ctx) this.ctx.resume().catch(() => {});
      return;
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(gainVal, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {
      // Audio error safety
    }
  }

  playNoise(duration = 0.1, gainVal = 0.2) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') {
      if (this.ctx) this.ctx.resume().catch(() => {});
      return;
    }

    try {
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, t);
      gain.gain.linearRampToValueAtTime(0.0001, t + duration);

      noise.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + duration);
    } catch (e) {
      // Audio error safety
    }
  }

  // --- Game SFX ---

  footstep() {
    this.playTone(160, 'triangle', 0.06, 0.15);
  }

  hit() {
    this.playNoise(0.09, 0.25);
    this.playTone(220, 'sawtooth', 0.08, 0.2);
  }

  playerHurt() {
    this.playTone(180, 'sawtooth', 0.14, 0.25);
    setTimeout(() => this.playTone(110, 'square', 0.14, 0.25), 50);
  }

  monsterDeath() {
    this.playNoise(0.18, 0.25);
    setTimeout(() => this.playTone(95, 'square', 0.16, 0.2), 60);
  }

  potion() {
    const notes = [392, 523.25, 659.25, 783.99]; // G, C, E, G
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.1, 0.2), i * 60);
    });
  }

  equip() {
    this.playTone(440, 'triangle', 0.08, 0.2);
    setTimeout(() => this.playTone(660, 'triangle', 0.1, 0.2), 60);
  }

  lightning() {
    this.playNoise(0.3, 0.35);
    this.playTone(600, 'sawtooth', 0.2, 0.25);
    setTimeout(() => this.playTone(280, 'sawtooth', 0.18, 0.3), 70);
  }

  teleport() {
    const notes = [220, 330, 440, 550, 700];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.08, 0.18), i * 40);
    });
  }

  gold() {
    this.playTone(987, 'sine', 0.09, 0.2);
    setTimeout(() => this.playTone(1318, 'sine', 0.14, 0.2), 80);
  }

  stairs() {
    const notes = [440, 370, 311, 261];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.12, 0.2), i * 90);
    });
  }

  levelUp() {
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25];
    arpeggio.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.14, 0.22), i * 90);
    });
  }

  gameOver() {
    const notes = [260, 240, 210, 180];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.25, 0.25), i * 160);
    });
  }

  victory() {
    const fanfare = [392, 523.25, 659.25, 783.99, 1046.5];
    fanfare.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.2, 0.25), i * 120);
    });
  }
}

export const audio = new SoundFX();
