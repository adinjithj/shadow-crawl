/**
 * Retro 8-bit Procedural Web Audio Synthesizer.
 * Generates sound effects dynamically without any external audio files.
 */
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('shadow_crawl_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('shadow_crawl_muted', this.muted);
    return this.muted;
  }

  // --- Sound Generation Primitives ---

  playTone(freq, type = 'square', duration = 0.1, gainVal = 0.1, decay = true) {
    if (this.muted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      if (decay) {
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio interruption errors
    }
  }

  playNoise(duration = 0.1, gainVal = 0.1) {
    if (this.muted || !this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {
      // Ignore
    }
  }

  // --- High-Level Game SFX ---

  footstep() {
    this.playTone(120, 'triangle', 0.04, 0.03);
  }

  hit() {
    this.playNoise(0.08, 0.12);
    this.playTone(180, 'sawtooth', 0.08, 0.08);
  }

  playerHurt() {
    this.playTone(160, 'sawtooth', 0.15, 0.15);
    setTimeout(() => this.playTone(90, 'sawtooth', 0.12, 0.12), 60);
  }

  monsterDeath() {
    this.playNoise(0.18, 0.15);
    setTimeout(() => this.playTone(80, 'square', 0.14, 0.08), 50);
  }

  potion() {
    const notes = [330, 440, 550, 660];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.08, 0.08), i * 50);
    });
  }

  equip() {
    this.playTone(400, 'triangle', 0.06, 0.08);
    setTimeout(() => this.playTone(600, 'triangle', 0.08, 0.08), 50);
  }

  lightning() {
    this.playNoise(0.25, 0.2);
    this.playTone(520, 'sawtooth', 0.18, 0.12);
    setTimeout(() => this.playTone(260, 'sawtooth', 0.15, 0.15), 60);
  }

  teleport() {
    const notes = [200, 300, 450, 600, 800];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.06, 0.07), i * 35);
    });
  }

  gold() {
    this.playTone(987, 'sine', 0.08, 0.07);
    setTimeout(() => this.playTone(1318, 'sine', 0.12, 0.07), 70);
  }

  stairs() {
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.1, 0.08), i * 80);
    });
  }

  levelUp() {
    const arpeggio = [261.63, 329.63, 392.00, 523.25]; // C - E - G - C
    arpeggio.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.15, 0.1), i * 100);
    });
  }

  gameOver() {
    const notes = [220, 207.65, 196, 185];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.3, 0.15), i * 160);
    });
  }

  victory() {
    const fanfare = [392, 523.25, 659.25, 783.99]; // G - C - E - G
    fanfare.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.25, 0.12), i * 140);
    });
  }
}

export const audio = new SoundFX();
