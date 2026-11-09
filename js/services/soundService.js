/**
 * ============================================================================
 * INTERFACE SOUND SERVICE (Typewriter Hover & Minecraft Click / Apple Pay)
 * ============================================================================
 * High-performance audio engine with Web Audio API buffer playback and fallback.
 *
 * Mappings:
 * - Hover over elements -> Typewriter mechanical key sound (MyInstants typewriter-15339)
 * - Click #btn-submit-request -> Apple Pay ascending two-tone chime
 * - Click #sound-toggle-btn -> Mute/unmute toggle state (no minecraft sound)
 * - Click any other button/interactive element -> Minecraft click (MyInstants minecraft-click)
 * ============================================================================
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastHoverTime = 0;
    this.hoverThrottleMs = 65; // Throttles rapid mouse sweeps
    this.storageKey = 'smartdesk_sounds_enabled';

    // AudioBuffers cache
    this.buffers = {
      typewriter: null,
      minecraftClick: null
    };

    this.soundPaths = {
      typewriter: './assets/sounds/typewriter.mp3',
      minecraftClick: './assets/sounds/minecraft_click.mp3'
    };
  }

  /**
   * Initializes audio system, preloads audio buffers, and binds UI listeners.
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

    // 2. AudioContext unlocker & buffer preloader on first user gesture
    const unlockAndLoadAudio = () => {
      this._getAudioContext();
      this._preloadAudioBuffers();
      window.removeEventListener('pointerdown', unlockAndLoadAudio);
      window.removeEventListener('keydown', unlockAndLoadAudio);
    };
    window.addEventListener('pointerdown', unlockAndLoadAudio, { passive: true, once: true });
    window.addEventListener('keydown', unlockAndLoadAudio, { passive: true, once: true });

    // Try preloading buffers immediately if browser allows
    this._preloadAudioBuffers();

    // 3. Setup Global UI Sound Listeners
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
   * Pre-fetches and decodes the audio buffers into Web Audio memory.
   * @private
   */
  async _preloadAudioBuffers() {
    const ctx = this._getAudioContext();
    if (!ctx) return;

    const loadSound = async (key, url) => {
      if (this.buffers[key]) return;
      try {
        const response = await fetch(url);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.buffers[key] = decodedBuffer;
      } catch {}
    };

    await Promise.all([
      loadSound('typewriter', this.soundPaths.typewriter),
      loadSound('minecraftClick', this.soundPaths.minecraftClick)
    ]);
  }

  /**
   * Internal helper to play a decoded AudioBuffer or fallback.
   * @private
   */
  _playAudio(bufferKey, volume = 0.5) {
    if (!this.enabled) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    const buffer = this.buffers[bufferKey];
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.value = volume;
        source.connect(gain).connect(ctx.destination);
        source.start(0);
        return;
      } catch {}
    }

    // Fallback: HTMLAudioElement
    try {
      const fallbackUrl = this.soundPaths[bufferKey];
      if (fallbackUrl) {
        const audio = new Audio(fallbackUrl);
        audio.volume = volume;
        audio.play().catch(() => {});
      }
    } catch {}
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

    // Subtle audio confirmation when turning sound ON
    if (this.enabled) {
      this.playMinecraftClick();
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
    if (onIcon) {
      if (this.enabled) {
        onIcon.removeAttribute('hidden');
        onIcon.style.display = 'block';
      } else {
        onIcon.setAttribute('hidden', '');
        onIcon.style.display = 'none';
      }
    }
    if (offIcon) {
      if (this.enabled) {
        offIcon.setAttribute('hidden', '');
        offIcon.style.display = 'none';
      } else {
        offIcon.removeAttribute('hidden');
        offIcon.style.display = 'block';
      }
    }
  }

  /**
   * Binds pointerenter hover (typewriter) and click triggers (minecraft click / Apple Pay).
   * @private
   */
  _bindUiSoundTriggers() {
    if (typeof document === 'undefined') return;

    // Selector targeting elements for hover typewriter sound
    const hoverElementsSelector = [
      'a[href]',
      'button',
      'input:not([type="hidden"])',
      'textarea',
      'select',
      '.theme-opt',
      '.sound-toggle-btn',
      '.outage-toggle-wrapper',
      '.btn-status-action',
      '.btn-copy-id',
      '.btn-quick-fill',
      '.metric-chip',
      '.request-card',
      '.status-badge',
      '[role="button"]',
      'label'
    ].join(',');

    // 1. Element Hover: Typewriter Sound
    document.addEventListener(
      'pointerenter',
      (e) => {
        if (!this.enabled) return;
        const target = e.target;
        if (!(target instanceof Element)) return;

        const matched = target.closest(hoverElementsSelector);
        if (matched) {
          const now = performance.now();
          if (now - this.lastHoverTime >= this.hoverThrottleMs) {
            this.lastHoverTime = now;
            this.playTypewriter();
          }
        }
      },
      true // Capture phase
    );

    // 2. Click Handler:
    // - Submit Service Request (#btn-submit-request) -> Apple Pay ascending chime
    // - Sound toggle button (#sound-toggle-btn) -> Skipped (managed separately in toggleSound)
    // - Any other element/button -> Minecraft Click
    document.addEventListener(
      'click',
      (e) => {
        if (!this.enabled) return;
        const target = e.target;
        if (!(target instanceof Element)) return;

        // Skip sound toggle button (handled explicitly by toggleSound())
        if (target.closest('#sound-toggle-btn')) {
          return;
        }

        // Case A: Submit Service Request Button -> Apple Pay Chime
        if (target.closest('#btn-submit-request')) {
          this.playApplePay();
          return;
        }

        // Case B: Any other clickable element or button -> Minecraft Click
        const clickable = target.closest([
          'button',
          'a[href]',
          '.theme-opt',
          '.outage-toggle-wrapper',
          '.btn-status-action',
          '.btn-copy-id',
          '.btn-quick-fill',
          '.btn-clear-search',
          '#btn-reset-filters',
          'input[type="submit"]',
          'input[type="checkbox"]',
          '[role="button"]'
        ].join(','));

        if (clickable && !clickable.hasAttribute('disabled')) {
          this.playMinecraftClick();
        }
      },
      true
    );
  }

  /**
   * Plays the Typewriter sound on element hover.
   */
  playTypewriter() {
    this._playAudio('typewriter', 0.4);
  }

  /**
   * Plays the Minecraft Click sound on general button/element clicks.
   */
  playMinecraftClick() {
    this._playAudio('minecraftClick', 0.5);
  }

  /**
   * Plays the Apple Pay two-tone ascending chime (C6 -> G6)
   * specifically for #btn-submit-request.
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
      this._synthesizeChimeNote(ctx, master, 2093.0, t, 0.005, 0.15, 0.05);

      // --- TONE 2: G6 (1568.0 Hz) - arrives 85ms later ---
      const t2 = t + 0.085;
      this._synthesizeChimeNote(ctx, master, 1568.0, t2, 0.005, 0.35, 0.24);
      this._synthesizeChimeNote(ctx, master, 3136.0, t2, 0.005, 0.28, 0.06);

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
