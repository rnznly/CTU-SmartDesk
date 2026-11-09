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
 * ============================================================================
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastHoverTime = 0;
    this.lastOutageSoundTime = 0;
    this.lastScribblenautsTime = 0;
    this.hoverThrottleMs = 75; // Throttles rapid hover triggers
    this.storageKey = 'smartdesk_sounds_enabled';

    // AudioBuffers cache
    this.buffers = {
      typewriter: null,
      clickPen: null,
      scribblenauts: null,
      outageSwitch: null
    };

    this.soundPaths = {
      typewriter: './assets/sounds/typewriter.mp3',
      clickPen: './assets/sounds/click_pen.mp3',
      scribblenauts: './assets/sounds/scribblenauts.mp3',
      outageSwitch: './assets/sounds/switch_notification.mp3'
    };
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
