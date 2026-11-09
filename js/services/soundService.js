/**
 * ============================================================================
 * INTERFACE SOUND SERVICE (Custom Multi-Sound Experience)
 * ============================================================================
 * Audio rules:
 * 1. Apple Pay Ascending Chime:
 *    - Click #sound-toggle-btn (Sound On/Off button)
 *    - Click #btn-submit-request (Submit Service Request button)
 * 2. Typewriter Key Sound (typewriter.mp3):
 *    - Hover on containers (.surface-card, .request-card, #app-header, .metrics-strip)
 *    - Hover on nav buttons (#filter-container button: All, Pending, In Progress, Resolved)
 * 3. Scribblenauts Key Press Sound (scribblenauts.mp3):
 *    - Click #btn-sample-fill (Auto-fill sample ticket)
 *    - Click copy ID button (.btn-copy-id, [data-action="copy"])
 * 4. Switch Notification Sound (switch_notification.mp3):
 *    - Click #toggle-server-failure / #outage-wrapper (Simulate 503 Outage switch)
 * 5. Click Pen Sound (click_pen.mp3):
 *    - Click nav filter buttons (All, Pending, In Progress, Resolved)
 *    - Click status action buttons (Start in progress, Mark as resolved, Re-open (Pending))
 *    - Click theme mode option buttons (.theme-opt)
 * 6. Minecraft Click Sound (minecraft_click.mp3):
 *    - Click any other buttons/controls (clear search, reset filters)
 * ============================================================================
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastHoverTime = 0;
    this.lastOutageSoundTime = 0;
    this.hoverThrottleMs = 75; // Throttles rapid hover triggers
    this.storageKey = 'smartdesk_sounds_enabled';

    // AudioBuffers cache
    this.buffers = {
      typewriter: null,
      clickPen: null,
      minecraftClick: null,
      scribblenauts: null,
      outageSwitch: null
    };

    this.soundPaths = {
      typewriter: './assets/sounds/typewriter.mp3',
      clickPen: './assets/sounds/click_pen.mp3',
      minecraftClick: './assets/sounds/minecraft_click.mp3',
      scribblenauts: './assets/sounds/scribblenauts.mp3',
      outageSwitch: './assets/sounds/switch_notification.mp3'
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
      loadSound('clickPen', this.soundPaths.clickPen),
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
   * Triggers Apple Pay sound when clicked.
   * @returns {boolean}
   */
  toggleSound() {
    const wasEnabled = this.enabled;
    this.enabled = !this.enabled;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, String(this.enabled));
      }
    } catch {}

    this._updateToggleButtonUI();

    // Apple Pay sound plays when sound button is clicked (if turned ON or as feedback)
    if (this.enabled) {
      this.playApplePay();
    } else if (wasEnabled) {
      // Temporarily enable context to play the farewell chime then mute
      this.enabled = true;
      this.playApplePay();
      this.enabled = false;
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
   * Binds pointerenter hover (typewriter) and click triggers (Apple Pay / Click Pen / Minecraft).
   * @private
   */
  _bindUiSoundTriggers() {
    if (typeof document === 'undefined') return;

    // Selector targeting containers and nav buttons for typewriter hover sound
    const hoverTypewriterSelector = [
      '.surface-card',
      '.request-card',
      '#app-header',
      '.metrics-strip',
      '#filter-container button',
      '.filter-bar-row button'
    ].join(',');

    // 1. Box / Nav Button Hover: Typewriter Sound
    // Plays ONCE when entering the box from outside, never rapidly across internal elements!
    document.addEventListener(
      'pointerenter',
      (e) => {
        if (!this.enabled) return;
        const target = e.target;
        if (!(target instanceof Element)) return;

        const box = target.closest(hoverTypewriterSelector);
        if (!box) return;

        // Only fire if entering the box from the outside!
        const fromElement = e.relatedTarget;
        if (fromElement instanceof Node && box.contains(fromElement)) {
          return; // Already inside this box
        }

        const now = performance.now();
        if (now - this.lastHoverTime >= 100) {
          this.lastHoverTime = now;
          this.playTypewriter();
        }
      },
      true
    );

    // 2. Click Handler:
    document.addEventListener(
      'click',
      (e) => {
        if (!this.enabled) return;
        const target = e.target;
        if (!(target instanceof Element)) return;

        // Skip sound toggle button here (toggleSound() handles its own Apple Pay feedback)
        if (target.closest('#sound-toggle-btn')) {
          return;
        }

        // Case A: Submit Service Request Button -> Apple Pay Chime
        if (target.closest('#btn-submit-request')) {
          this.playApplePay();
          return;
        }

        // Case B: Auto-fill Sample Ticket Button -> Scribblenauts Key Press
        if (target.closest('#btn-sample-fill, .btn-sample-fill, .btn-quick-fill')) {
          this.playScribblenauts();
          return;
        }

        // Case B2: Copy Request ID Button -> Scribblenauts Sound
        if (target.closest('.btn-copy-id, [data-action="copy"]')) {
          this.playScribblenauts();
          return;
        }

        // Case C: Simulate 503 Outage Toggle Switch -> Nintendo Switch Click
        if (target.closest('#toggle-server-failure, #outage-wrapper, .outage-toggle-wrapper')) {
          const now = performance.now();
          if (now - this.lastOutageSoundTime >= 200) {
            this.lastOutageSoundTime = now;
            this.playOutageSwitch();
          }
          return;
        }

        // Case D: Click Pen Sound ->
        // 1. Nav filter buttons: All, Pending, In Progress, Resolved (#filter-container button)
        // 2. Card action buttons: Start in progress, Mark as resolved, Re-open (Pending) (.btn-status-action)
        // 3. Theme option buttons (.theme-opt)
        const isNavFilterBtn = target.closest('#filter-container button, .filter-bar-row button');
        const isStatusActionBtn = target.closest('.btn-status-action');
        const isThemeOptBtn = target.closest('.theme-opt');

        if (isNavFilterBtn || isStatusActionBtn || isThemeOptBtn) {
          this.playClickPen();
          return;
        }

        // Case E: Minecraft Click -> Any other clickable buttons/controls (clear search, reset filters)
        const generalClickable = target.closest([
          'button',
          'a[href]',
          '.theme-opt',
          '.btn-clear-search',
          '#btn-reset-filters',
          'input[type="submit"]',
          'input[type="checkbox"]',
          '[role="button"]'
        ].join(','));

        if (generalClickable && !generalClickable.hasAttribute('disabled')) {
          this.playMinecraftClick();
        }
      },
      true
    );
  }

  /**
   * Plays the Typewriter sound on container & nav button hovers.
   */
  playTypewriter() {
    this._playAudio('typewriter', 0.4);
  }

  /**
   * Plays the Scribblenauts key press sound on auto-fill sample click.
   */
  playScribblenauts() {
    this._playAudio('scribblenauts', 0.6);
  }

  /**
   * Plays the Switch Notification sound on 503 outage toggle.
   */
  playOutageSwitch() {
    this._playAudio('outageSwitch', 0.6);
  }

  playNintendoSwitch() {
    this.playOutageSwitch();
  }

  /**
   * Plays the Click Pen sound on nav filter & status action button clicks.
   */
  playClickPen() {
    this._playAudio('clickPen', 0.55);
  }

  /**
   * Plays the Minecraft Click sound on general button/element clicks.
   */
  playMinecraftClick() {
    this._playAudio('minecraftClick', 0.5);
  }

  /**
   * Plays the Apple Pay two-tone ascending chime (C6 -> G6)
   * used exclusively for #sound-toggle-btn and #btn-submit-request.
   */
  playApplePay() {
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
