/**
 * ============================================================================
 * GOOGLE STITCH HOME INTERACTIVE BACKGROUND (stitch.google.com/home)
 * ============================================================================
 * Faithful recreation of the Google Stitch Home landing page background:
 * 1. Organic Undulating Wave — continuous mathematical wave (sin/cos motion)
 * 2. Physical Pointer Ripple — dots organically push away from cursor with elastic rebound
 * 3. Reactive Luminescence — dots scale up and illuminate with Stitch violet/lavender hue (#a78bfa)
 * 4. Smooth Spring Physics — position damping (0.12 lerp) for lifelike fluid motion
 * 5. Lifecycle Management — pauses on tab switch (Page Visibility API) for 0% idle drain
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

    // Configuration parameters (Google Stitch Home specification - 50% scale)
    this.spacing = 15;            // Grid spacing for dots (50% scaled down from 30px)
    this.dotRadiusBase = 0.75;    // Base resting radius (crisp 1.5px diameter)
    this.mouseRadius = 110;       // Interaction/ripple radius (50% scaled)

    // Mouse tracking state
    this.mouse = {
      x: null,
      y: null,
      active: false
    };

    // Animation & physics state
    this.time = 0;
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
   * Recalculates canvas dimensions and particle grid.
   * @private
   */
  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.ceil(this.width / this.spacing) + 2;
    const rows = Math.ceil(this.height / this.spacing) + 2;
    const startX = (this.width % this.spacing) / 2;
    const startY = (this.height % this.spacing) / 2;

    this.dots = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const ox = startX + (c - 0.5) * this.spacing;
        const oy = startY + (r - 0.5) * this.spacing;
        this.dots.push({
          originX: ox,
          originY: oy,
          x: ox,
          y: oy,
          baseAlpha: 0.22 + (Math.sin(c * 0.5) * Math.cos(r * 0.5) + 1) * 0.08
        });
      }
    }

    this._wake();
  }

  /**
   * Bind resize, pointer tracking, and visibility listeners.
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
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.active = true;
        this._wake();
      },
      { passive: true }
    );

    window.addEventListener(
      'pointerleave',
      () => {
        this.mouse.active = false;
        this.mouse.x = null;
        this.mouse.y = null;
      },
      { passive: true }
    );

    // Save battery when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isSleeping = true;
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      } else {
        this.isSleeping = false;
        this._wake();
      }
    });
  }

  /**
   * Force refresh when light/dark theme toggles.
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
    }
    if (!this.rafId) {
      this._tick();
    }
  }

  /**
   * Core simulation and render step (Google Stitch Home physics & wave).
   * @private
   */
  _tick() {
    if (this.isSleeping) return;

    this.time += 0.024;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isDark = document.documentElement.classList.contains('dark');
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const hasMouse = this.mouse.active && mx !== null && my !== null;
    const radius = this.mouseRadius;
    const radiusSq = radius * radius;

    for (let i = 0; i < this.dots.length; i++) {
      const dot = this.dots[i];

      // 1. Organic wave calculation (sine/cosine spatial wave - 50% scale amplitude)
      const waveX = Math.sin(this.time + dot.originY * 0.024) * 2.25;
      const waveY = Math.cos(this.time + dot.originX * 0.024) * 2.25;

      let targetX = dot.originX + waveX;
      let targetY = dot.originY + waveY;
      let proximityForce = 0;

      // 2. Mouse ripple & organic repulsion (Google Stitch signature interaction - 50% scale)
      if (hasMouse) {
        const dx = mx - dot.originX;
        const dy = my - dot.originY;
        const distSq = dx * dx + dy * dy;

        if (distSq < radiusSq) {
          const dist = Math.sqrt(distSq);
          const force = 1 - dist / radius;
          proximityForce = force * force; // Quadratic bell curve for smooth indentation

          const angle = Math.atan2(dy, dx);
          // Gently push dots away to form an organic interactive ripple indentation
          targetX -= Math.cos(angle) * force * 14;
          targetY -= Math.sin(angle) * force * 14;
        }
      }

      // 3. Smooth spring damping towards target position (0.12 lerp)
      dot.x += (targetX - dot.x) * 0.12;
      dot.y += (targetY - dot.y) * 0.12;

      // 4. Dot size & luminescence (50% scale)
      const dotSize = this.dotRadiusBase + proximityForce * 0.75;
      const waveShimmer = Math.sin(this.time * 1.4 + dot.originX * 0.018) * 0.08;
      const alpha = Math.min(
        1,
        Math.max(
          0.12,
          dot.baseAlpha + waveShimmer + proximityForce * 0.55
        )
      );

      // 5. Render dot in Google Stitch signature violet/lavender (#a78bfa)
      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);

      if (isDark) {
        if (proximityForce > 0.08) {
          // Pearlescent illuminated lavender under cursor
          this.ctx.fillStyle = `rgba(196, 181, 253, ${alpha.toFixed(3)})`;
        } else {
          // Ambient Stitch violet dot
          this.ctx.fillStyle = `rgba(167, 139, 250, ${alpha.toFixed(3)})`;
        }
      } else {
        if (proximityForce > 0.08) {
          // Indigo highlight under cursor
          this.ctx.fillStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
        } else {
          // Ambient slate-purple dot
          this.ctx.fillStyle = `rgba(139, 92, 246, ${alpha.toFixed(3)})`;
        }
      }

      this.ctx.fill();
    }

    this.rafId = requestAnimationFrame(() => this._tick());
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
