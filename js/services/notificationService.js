/**
 * @file notificationService.js
 * @description Accessible Minimalist Toast Pill Notification Manager.
 * Styled to Bryl Lim minimalist monochrome aesthetic with glowing indicator dot.
 */

class NotificationService {
  constructor() {
    this.containerId = 'toast-container';
    this.defaultDuration = 3000;
    this.activeTimeout = null;
  }

  /**
   * Ensures the floating toast container exists in the DOM.
   * @private
   * @returns {HTMLElement|null}
   */
  _getOrCreateContainer() {
    if (typeof document === 'undefined') return null;

    let container = document.getElementById(this.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Displays an accessible, sleek minimalist animated toast pill.
   * Enforces single-toast presentation (never stacks).
   * @param {string} message - Feedback message to display
   * @param {'success'|'error'|'warning'|'info'} [type='info'] - Visual type
   * @param {number} [durationMs=3000] - Auto-dismiss timeout in milliseconds
   */
  show(message, type = 'info', durationMs = this.defaultDuration) {
    if (typeof document === 'undefined') {
      console.log(`[Notification ${type.toUpperCase()}]: ${message}`);
      return;
    }

    const container = this._getOrCreateContainer();
    if (!container) return;

    // Clear any active dismiss timer
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }

    // Single-toast enforcement: remove any existing toast immediately (never stack)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Create sleek floating pill toast
    const toast = document.createElement('div');
    toast.className = `toast-pill toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    toast.innerHTML = `
      <span class="toast-dot toast-dot-${type}" aria-hidden="true"></span>
      <span class="toast-message">${message}</span>
      <button type="button" class="toast-close" aria-label="Dismiss notification">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Manual dismiss
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._dismissToast(toast);
      });
    }

    container.appendChild(toast);

    // Auto-dismiss after duration
    if (durationMs > 0) {
      this.activeTimeout = setTimeout(() => {
        this._dismissToast(toast);
      }, durationMs);
    }
  }

  /**
   * Dismisses the active toast with smooth exit animation.
   * @private
   * @param {HTMLElement} toast
   */
  _dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 180);
  }

  /**
   * Clears active toast immediately.
   */
  clear() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
      this.activeTimeout = null;
    }
  }

  // Convenience shortcuts
  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    this.show(message, 'error', duration);
  }

  warning(message, duration = 3500) {
    this.show(message, 'warning', duration);
  }

  info(message, duration = 2200) {
    this.show(message, 'info', duration);
  }
}

export const notificationService = new NotificationService();
