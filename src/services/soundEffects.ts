// Web Audio API Synthesizer for tactile BobaFlow sound effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Satisfying round chewy boba pearl drop sound (deep low frequency thump with bubble release)
  playBobaDrop(pitchVariance = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 160 * pitchVariance + (Math.random() * 20 - 10);
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Ice cube clinking sound against glass
  playIceClink() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const freq = 1200 + Math.random() * 600;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.06);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Liquid stream pouring splash sound
  playPourSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Fast bubbling fm synth
    const osc = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 + Math.random() * 80, t);
    osc.frequency.linearRampToValueAtTime(400, t + 0.15);

    mod.type = 'sine';
    mod.frequency.setValueAtTime(45, t);
    modGain.gain.setValueAtTime(100, t);

    mod.connect(modGain);
    modGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    mod.start(t);
    osc.start(t);
    mod.stop(t + 0.17);
    osc.stop(t + 0.17);
  }

  // Heat seal mechanical press hiss & chime
  playSealSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);

    // Followed by confirmation bell
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t2 = this.ctx.currentTime;
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(880, t2);
      bellGain.gain.setValueAtTime(0.15, t2);
      bellGain.gain.exponentialRampToValueAtTime(0.001, t2 + 0.3);
      bell.connect(bellGain);
      bellGain.connect(this.ctx.destination);
      bell.start(t2);
      bell.stop(t2 + 0.3);
    }, 150);
  }

  // Straw puncture punch "POP!"
  playStrawPop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Slurp with bubbly suction
  playSlurp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(650, t + 0.2);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Customer happy bell / coin tip chime
  playTipChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  // Tactile button click
  playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Affirmative success chime
  playSuccess() {
    this.playTipChime();
  }

  // Error buzz/denial sound
  playFailure() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // POS Add to Cart soft affirmative blip
  playAddCart() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // POS Cash Register drawer ka-ching with bell
  playCashDrawer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Mechanical drawer slide
    const slideOsc = this.ctx.createOscillator();
    const slideGain = this.ctx.createGain();
    slideOsc.type = 'triangle';
    slideOsc.frequency.setValueAtTime(220, t);
    slideOsc.frequency.exponentialRampToValueAtTime(90, t + 0.12);
    slideGain.gain.setValueAtTime(0.15, t);
    slideGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    slideOsc.connect(slideGain);
    slideGain.connect(this.ctx.destination);
    slideOsc.start(t);
    slideOsc.stop(t + 0.15);

    // Bell chime (classic register bell)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const tBell = this.ctx.currentTime;
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(1567.98, tBell); // G6
      bellGain.gain.setValueAtTime(0.2, tBell);
      bellGain.gain.exponentialRampToValueAtTime(0.001, tBell + 0.4);
      bell.connect(bellGain);
      bellGain.connect(this.ctx.destination);
      bell.start(tBell);
      bell.stop(tBell + 0.45);
    }, 90);
  }

  // POS Card terminal dual-tone beep
  playCardBeep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [1200, 1600].forEach((freq, i) => {
      if (!this.ctx) return;
      const toneTime = t + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, toneTime);
      gain.gain.setValueAtTime(0.12, toneTime);
      gain.gain.exponentialRampToValueAtTime(0.001, toneTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(toneTime);
      osc.stop(toneTime + 0.08);
    });
  }

  // Order Ready alert chime
  playOrderReady() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [659.25, 880, 1174.66]; // E5, A5, D6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const tNote = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, tNote);
      gain.gain.setValueAtTime(0.15, tNote);
      gain.gain.exponentialRampToValueAtTime(0.001, tNote + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(tNote);
      osc.stop(tNote + 0.35);
    });
  }

  // Shake ice & liquid
  playShake() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, t + i * 0.05);
      gain.gain.setValueAtTime(0.1, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.05);
    }
  }

  // Torched crème brûlée flame whoosh
  playTorchFlame() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.25);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.32);
  }
  // Ambient Lo-fi Cafe Background Music Synthesizer
  public isLofiPlaying: boolean = false;
  private lofiInterval: number | null = null;
  private lofiGain: GainNode | null = null;

  startLofiMusic() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    if (this.isLofiPlaying) return;

    this.isLofiPlaying = true;
    this.lofiGain = this.ctx.createGain();
    this.lofiGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    this.lofiGain.connect(this.ctx.destination);

    // Warm peaceful pentatonic jazzy chords progression
    // Chord 1: Fmaj7 (F3, A3, C4, E4)
    // Chord 2: Em7 (E3, G3, B3, D4)
    // Chord 3: Dm7 (D3, F3, A3, C4)
    // Chord 4: Cmaj7 (C3, E3, G3, B3)
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94]  // Cmaj7
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.isLofiPlaying || !this.ctx || !this.lofiGain) return;
      const currentNotes = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      currentNotes.forEach((freq, idx) => {
        if (!this.ctx || !this.lofiGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'sine';
        // Subtle vibrato
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        noteGain.gain.setValueAtTime(0.001, now + idx * 0.05);
        noteGain.gain.linearRampToValueAtTime(0.05, now + idx * 0.05 + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 2.8);

        osc.connect(noteGain);
        noteGain.connect(this.lofiGain);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 3.0);
      });
    };

    playNextChord();
    this.lofiInterval = window.setInterval(playNextChord, 3200);
  }

  stopLofiMusic() {
    this.isLofiPlaying = false;
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    if (this.lofiGain && this.ctx) {
      this.lofiGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        this.lofiGain?.disconnect();
        this.lofiGain = null;
      }, 400);
    }
  }

  toggleLofiMusic(): boolean {
    if (this.isLofiPlaying) {
      this.stopLofiMusic();
      return false;
    } else {
      this.startLofiMusic();
      return true;
    }
  }
}

export const sounds = new SoundEngine();
