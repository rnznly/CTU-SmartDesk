/**
 * ============================================================================
 * INTERACTIVE HALFTONE CANVAS ENGINE (Google Stitch Style)
 * ============================================================================
 * Clean, subtle, compact dot grid glow inspired by Google Stitch (stitch.withgoogle.com).
 *
 * Characteristics:
 * - Fixed grid geometry: dots stay anchored (glow only, zero chaotic displacement)
 * - Compact hover radius (~55px) illuminating only the immediate cluster beneath pointer
 * - Subtle, controlled luminescence (max ~0.55 alpha in dark, ~0.45 in light)
 * - Microscopic expansion (0.95px to 1.35px max, zero giant bloom halos)
 * - Crisp ~0.6s smooth decay for an understated, elegant feel
 * - Complete idle hibernation (0% CPU/GPU overhead when pointer is stationary)
 * ============================================================================
 */

export class InteractiveHalftone {
  /**
   * @param {string} canvasId - Target canvas DOM element ID
   */
  constructor(canvasId = 'halftone-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.dots = [];

    // Configuration parameters (Google Stitch style: subtle, compact, glow-only)
    this.spacing = 22;            // Grid dot spacing in CSS pixels
    this.baseRadius = 0.95;       // Resting dot radius
    this.hoverRadius = 55;        // Compact interaction radius (Google Stitch style)
    this.glowDecay = 0.88;        // Clean, quick fade (~0.6s)

    // Cursor state
    this.pointer = { x: -9999, y: -9999, active: false };

    // Engine loop management
    this.isSleeping = false;
    this.rafId = null;

    this._init();
  }

  /**
   * Initialize layout, event listeners, and start loop.
   * @private
   */
  _init() {
    // Notify container that canvas engine is active
    const container = this.canvas.closest('.backdrop-halftone-container');
    if (container) {
      container.classList.add('has-canvas');
    }

    this._resize();
    this._bindEvents();
    this._wake();
  }

  /**
   * Recalculates canvas dimensions and particle coordinates.
   * @private
   */
  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(this.width / this.spacing) + 1;
    const rows = Math.ceil(this.height / this.spacing) + 1;
    const startX = (this.width % this.spacing) / 2;
    const startY = (this.height % this.spacing) / 2;

    this.dots = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const bx = startX + c * this.spacing;
        const by = startY + r * this.spacing;
        this.dots.push({
          baseX: bx,
          baseY: by,
          glow: 0
        });
      }
    }

    this._wake();
  }

  /**
   * Bind resize and pointer tracking listeners.
   * @private
   */
  _bindEvents() {
    let resizeTimer = null;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this._resize(), 100);
      },
      { passive: true }
    );

    window.addEventListener(
      'pointermove',
      (e) => {
        this.pointer.x = e.clientX;
        this.pointer.y = e.clientY;
        this.pointer.active = true;
        this._wake();
      },
      { passive: true }
    );

    window.addEventListener(
      'pointerleave',
      () => {
        this.pointer.active = false;
        this.pointer.x = -9999;
        this.pointer.y = -9999;
      },
      { passive: true }
    );
  }

  /**
   * Force theme refresh when light/dark mode toggles.
   */
  onThemeChange() {
    this._wake();
  }

  /**
   * Wake the animation loop if sleeping.
   * @private
   */
  _wake() {
    if (this.isSleeping) {
      this.isSleeping = false;
      this._tick();
    } else if (!this.rafId) {
      this._tick();
    }
  }

  /**
   * Core simulation and render step.
   * @private
   */
  _tick() {
    if (this.isSleeping) return;

    let hasActivity = false;
    const isDark = document.documentElement.classList.contains('dark');
    const px = this.pointer.x;
    const py = this.pointer.y;
    const hRadiusSq = this.hoverRadius * this.hoverRadius;

    // Palette tokens (Google Stitch style subtle contrast)
    const dotR = isDark ? 245 : 12;
    const dotG = isDark ? 245 : 12;
    const dotB = isDark ? 250 : 12;
    const baseAlpha = isDark ? 0.215 : 0.205;
    const maxGlowAlpha = isDark ? 0.55 : 0.45;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];

      // 1. Pointer proximity (Glow excitation only - Google Stitch style)
      if (this.pointer.active) {
        const dx = d.baseX - px;
        const dy = d.baseY - py;
        const distSq = dx * dx + dy * dy;

        if (distSq < hRadiusSq) {
          const dist = Math.sqrt(distSq);
          const ratio = 1 - dist / this.hoverRadius;
          const intensity = ratio * ratio; // quadratic bell curve for soft falloff

          d.glow = Math.max(d.glow, intensity);
          hasActivity = true;
        }
      }

      // 2. Smooth glow decay over time
      if (d.glow > 0.005) {
        d.glow *= this.glowDecay;
        hasActivity = true;
      } else {
        d.glow = 0;
      }

      // 3. Render dot (Subtle, crisp, minimal expansion - NO giant halos)
      const currentRadius = this.baseRadius + d.glow * 0.40;
      const alpha = baseAlpha + d.glow * (maxGlowAlpha - baseAlpha);

      this.ctx.beginPath();
      this.ctx.arc(d.baseX, d.baseY, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${dotR}, ${dotG}, ${dotB}, ${alpha.toFixed(3)})`;
      this.ctx.fill();
    }

    // Hibernate if settled to preserve battery/GPU
    if (!hasActivity && !this.pointer.active) {
      this.isSleeping = true;
      this.rafId = null;
    } else {
      this.rafId = requestAnimationFrame(() => this._tick());
    }
  }

  /**
   * Cleanup resources if destroyed.
   */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
