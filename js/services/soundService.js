/**
 * ============================================================================
 * INTERFACE SOUND SERVICE (Web Audio API Synthesizer)
 * ============================================================================
 * Synthesizes ultra-clean UI feedback audio without external audio files.
 *
 * Features:
 * - Subtle "tick" sound when hovering over form textfields or buttons
 * - Iconic Apple Pay ascending two-tone chime when buttons are clicked
 * - Sound toggle button controller with localStorage persistence
 * - Complies with browser autoplay policies (resumes AudioContext on interaction)
 * ============================================================================
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastTickTime = 0;
    this.tickThrottleMs = 70; // Prevent spamming ticks on rapid mouse sweeps
    this.storageKey = 'smartdesk_sounds_enabled';
  }

  /**
   * Initializes audio system and binds UI listeners.
   */
  init() {
    // 1. Load sound preference (defaults to true)
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      }
    } catch {}

    this._updateToggleButtonUI();

    // 2. AudioContext lazy activator on first user gesture
    const unlockAudio = () => {
      this._getAudioContext();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
    window.addEventListener('keydown', unlockAudio, { passive: true, once: true });

    // 3. Setup Global UI Sound Listeners (Hover ticks & Click chimes)
    this._bindUiSoundTriggers();
  }

  /**
   * Returns or lazily constructs the Web Audio context.
   * @private
   */
  _getAudioContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Toggles sound on/off and returns new state.
   * @returns {boolean}
   */
  toggleSound() {
    this.enabled = !this.enabled;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, String(this.enabled));
      }
    } catch {}

    this._updateToggleButtonUI();

    // If turned on, play the Apple Pay chime as instant confirmation
    if (this.enabled) {
      this.playApplePay();
    }

    return this.enabled;
  }

  /**
   * Sets sound enabled state explicitly.
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = !!enabled;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, String(this.enabled));
      }
    } catch {}
    this._updateToggleButtonUI();
  }

  /**
   * Checks whether sounds are enabled.
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Updates sound toggle button icons and ARIA attributes in DOM.
   * @private
   */
  _updateToggleButtonUI() {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;

    btn.setAttribute('aria-pressed', String(this.enabled));
    btn.setAttribute('title', this.enabled ? 'Sound On' : 'Sound Off');
    btn.setAttribute('aria-label', this.enabled ? 'Disable interface sounds' : 'Enable interface sounds');
    btn.classList.toggle('is-active', this.enabled);

    const onIcon = btn.querySelector('[data-sound-on]');
    const offIcon = btn.querySelector('[data-sound-off]');
    if (onIcon) onIcon.toggleAttribute('hidden', !this.enabled);
    if (offIcon) offIcon.toggleAttribute('hidden', this.enabled);
  }

  /**
   * Binds pointerenter hover ticks and click chimes.
   * @private
   */
  _bindUiSoundTriggers() {
    if (typeof document === 'undefined') return;

    // Selector targeting textfields, inputs, selects, textareas, and buttons
    const hoverSelector = [
      'input:not([type="hidden"])',
      'textarea',
      'select',
      'button',
      '.btn-status-action',
      '.theme-opt',
      '.outage-toggle-wrapper',
      '[role="button"]'
    ].join(',');

    // Hover Tick Listener
    document.addEventListener(
      'pointerenter',
      (e) => {
        if (!this.enabled) return;
        const target = e.target;
        if (!(target instanceof Element)) return;

        const matched = target.closest(hoverSelector);
        if (matched) {
          const now = performance.now();
          if (now - this.lastTickTime >= this.tickThrottleMs) {
            this.lastTickTime = now;
            this.playTick();
          }
        }
      },
      true // Capture phase to catch all interactive children
    );

    // Button Click: Apple Pay sound listener
    document.addEventListener(
      'click',
      (e) => {
        if (!this.enabled) return;
        const target = e.target;
        if (!(target instanceof Element)) return;

        // Skip sound toggle button itself (it manages its own feedback)
        if (target.closest('#sound-toggle-btn')) return;

        // Check if any button, submit, or clickable action was triggered
        const btn = target.closest('button, [role="button"], input[type="submit"], .outage-toggle-wrapper');
        if (btn && !btn.hasAttribute('disabled')) {
          this.playApplePay();
        }
      },
      true
    );
  }

  /**
   * Synthesizes a crisp, subtle mechanical tick sound for textfield/button hovers.
   */
  playTick() {
    if (!this.enabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.22;
      master.connect(ctx.destination);

      // 1. High bandpass noise burst (creates tactile mechanical click texture)
      const bufferSize = Math.max(1, Math.floor(0.016 * ctx.sampleRate));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(5400, t);
      filter.Q.value = 2.2;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.12, t + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);

      noise.connect(filter).connect(noiseGain).connect(master);
      noise.start(t);
      noise.stop(t + 0.016);

      // 2. High-frequency sine pip (2800 Hz) for a crisp glass tap
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800, t);

      oscGain.gain.setValueAtTime(0.0001, t);
      oscGain.gain.exponentialRampToValueAtTime(0.035, t + 0.001);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

      osc.connect(oscGain).connect(master);
      osc.start(t);
      osc.stop(t + 0.015);

      setTimeout(() => master.disconnect(), 60);
    } catch {}
  }

  /**
   * Synthesizes the iconic Apple Pay two-tone ascending chime (C6 -> G6)
   * with crystalline harmonic shimmer and soft stereo acoustic space.
   */
  playApplePay() {
    if (!this.enabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.value = 0.38;
      master.connect(ctx.destination);

      // --- TONE 1: C6 (1046.5 Hz) ---
      this._synthesizeChimeNote(ctx, master, 1046.5, t, 0.005, 0.22, 0.2);
      this._synthesizeChimeNote(ctx, master, 2093.0, t, 0.005, 0.15, 0.05); // High octave shimmer

      // --- TONE 2: G6 (1568.0 Hz) - arrives 85ms later (classic Apple Pay interval) ---
      const t2 = t + 0.085;
      this._synthesizeChimeNote(ctx, master, 1568.0, t2, 0.005, 0.35, 0.24);
      this._synthesizeChimeNote(ctx, master, 3136.0, t2, 0.005, 0.28, 0.06); // Harmonic bell presence

      // --- Subtle Warm Acoustic Shimmer Reverb ---
      this._applyShimmerReverb(ctx, master, t);

      setTimeout(() => master.disconnect(), 800);
    } catch {}
  }

  /**
   * Helper to synthesize individual sine chime tone with exponential decay.
   * @private
   */
  _synthesizeChimeNote(ctx, dest, freq, startTime, attack, decay, peak) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + decay);

    osc.connect(gain).connect(dest);
    osc.start(startTime);
    osc.stop(startTime + attack + decay + 0.02);
  }

  /**
   * Helper to attach soft shimmer reflection to chimes.
   * @private
   */
  _applyShimmerReverb(ctx, source, startTime) {
    try {
      const delay = ctx.createDelay(1);
      delay.delayTime.value = 0.1;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 4200;

      const feedback = ctx.createGain();
      feedback.gain.value = 0.24;

      const wet = ctx.createGain();
      wet.gain.value = 0.18;

      source.connect(delay);
      delay.connect(filter);
      filter.connect(feedback);
      feedback.connect(delay);
      filter.connect(wet);
      wet.connect(ctx.destination);

      setTimeout(() => {
        try {
          delay.disconnect();
          filter.disconnect();
          feedback.disconnect();
          wet.disconnect();
        } catch {}
      }, 700);
    } catch {}
  }
}

export const soundService = new SoundService();
