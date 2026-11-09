/**
 * ============================================================================
 * INTERACTIVE HALFTONE CANVAS ENGINE
 * ============================================================================
 * High-performance, physics-based reactive dot field inspired by bryllim.com.
 *
 * Capabilities:
 * - Responsive 2D particle grid reacting to cursor proximity
 * - Spring-damper displacement physics (Hooke's law)
 * - Trailing bloom/glow effect fading out over brief 1.5 - 2s window
 * - Theme-reactive (automatic palette switching between light and dark modes)
 * - Ultra-efficient: pauses requestAnimationFrame when idle (0% CPU/GPU overhead)
 * - High-DPI Retina display sharpness using window.devicePixelRatio
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

    // Configuration parameters
    this.spacing = 20;            // Grid dot spacing in CSS pixels
    this.baseRadius = 0.95;       // Resting dot radius
    this.hoverRadius = 110;       // Interaction cursor radius
    this.maxPush = 7;             // Max elastic displacement in pixels
    this.springK = 0.07;          // Spring return stiffness
    this.damping = 0.82;          // Velocity damping factor
    this.glowDecay = 0.945;       // Smooth glow decay factor (~1.8s half-life)

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
          x: bx,
          y: by,
          vx: 0,
          vy: 0,
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

    // Palette tokens based on theme
    const dotR = isDark ? 245 : 12;
    const dotG = isDark ? 245 : 12;
    const dotB = isDark ? 250 : 12;
    const baseAlpha = isDark ? 0.09 : 0.075;
    const maxGlowAlpha = isDark ? 0.85 : 0.7;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];

      // 1. Pointer interaction (Displacement + Glow excitation)
      if (this.pointer.active) {
        const dx = d.x - px;
        const dy = d.y - py;
        const distSq = dx * dx + dy * dy;

        if (distSq < hRadiusSq) {
          const dist = Math.sqrt(distSq);
          const ratio = 1 - dist / this.hoverRadius;
          const force = ratio * ratio * this.maxPush;
          const angle = Math.atan2(dy, dx);

          // Push dot away elastically
          d.vx += Math.cos(angle) * force * 0.35;
          d.vy += Math.sin(angle) * force * 0.35;

          // Excite glow
          d.glow = Math.max(d.glow, Math.min(1.0, d.glow + ratio * 0.85));
          hasActivity = true;
        }
      }

      // 2. Spring-damper physics return to origin
      const ax = (d.baseX - d.x) * this.springK;
      const ay = (d.baseY - d.y) * this.springK;
      d.vx = (d.vx + ax) * this.damping;
      d.vy = (d.vy + ay) * this.damping;
      d.x += d.vx;
      d.y += d.vy;

      // 3. Glow decay over time
      if (d.glow > 0.005) {
        d.glow *= this.glowDecay;
        hasActivity = true;
      } else {
        d.glow = 0;
      }

      if (Math.abs(d.vx) > 0.015 || Math.abs(d.vy) > 0.015) {
        hasActivity = true;
      }

      // 4. Render dot
      const currentRadius = this.baseRadius + d.glow * 1.6;
      const alpha = baseAlpha + d.glow * (maxGlowAlpha - baseAlpha);

      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, currentRadius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${dotR}, ${dotG}, ${dotB}, ${alpha.toFixed(3)})`;
      this.ctx.fill();

      // 5. Soft optical bloom halo for excited dots
      if (d.glow > 0.25) {
        const haloRadius = currentRadius + d.glow * 4.5;
        const haloAlpha = d.glow * (isDark ? 0.22 : 0.12);
        this.ctx.beginPath();
        this.ctx.arc(d.x, d.y, haloRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${dotR}, ${dotG}, ${dotB}, ${haloAlpha.toFixed(3)})`;
        this.ctx.fill();
      }
    }

    // Hibernate if settled to preserve resources
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
