/**
 * @file notificationService.js
 * @description Accessible Minimalist Toast Notification & Alert Feedback Manager.
 * Styled to Bryl Lim minimalist monochrome design specifications.
 */

class NotificationService {
  constructor() {
    this.containerId = 'toast-container';
    this.defaultDuration = 3500;
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
   * Returns a clean monochrome SVG micro-icon representing the notification type.
   * @private
   * @param {string} type
   * @returns {string}
   */
  _getIconSvg(type) {
    switch (type) {
      case 'success':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      case 'error':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      case 'warning':
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      case 'info':
      default:
        return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
  }

  /**
   * Displays an accessible, sleek minimalist animated toast banner.
   * @param {string} message - Feedback message to display
   * @param {'success'|'error'|'warning'|'info'} [type='info'] - Visual type
   * @param {number} [durationMs=3500] - Auto-dismiss timeout in milliseconds
   */
  show(message, type = 'info', durationMs = this.defaultDuration) {
    if (typeof document === 'undefined') {
      console.log(`[Notification ${type.toUpperCase()}]: ${message}`);
      return;
    }

    const container = this._getOrCreateContainer();
    if (!container) return;

    // 1. De-duplicate similar notifications (e.g. Outage toggle spam)
    const existingToasts = Array.from(container.querySelectorAll('.toast-item'));
    existingToasts.forEach((t) => {
      const msg = t.querySelector('.toast-message')?.textContent || '';
      if (
        (msg.includes('Outage') && message.includes('Outage')) ||
        msg === message
      ) {
        this._dismissToast(t, true);
      }
    });

    // 2. Limit maximum visible toasts to 2 to prevent screen cluttering
    while (container.children.length >= 2) {
      this._dismissToast(container.firstElementChild, true);
    }

    // 3. Create sleek toast element
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    toast.innerHTML = `
      <div class="toast-badge toast-badge-${type}">
        ${this._getIconSvg(type)}
      </div>
      <div class="toast-content">
        <p class="toast-message">${message}</p>
      </div>
      <button type="button" class="toast-close" aria-label="Dismiss notification">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Manual dismiss
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this._dismissToast(toast);
      });
    }

    container.appendChild(toast);

    // Auto-dismiss
    if (durationMs > 0) {
      setTimeout(() => {
        this._dismissToast(toast);
      }, durationMs);
    }
  }

  /**
   * Dismisses an individual toast with exit animation.
   * @private
   * @param {HTMLElement} toast
   * @param {boolean} [immediate=false]
   */
  _dismissToast(toast, immediate = false) {
    if (!toast || !toast.parentElement) return;
    if (immediate) {
      toast.remove();
      return;
    }
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 200);
  }

  /**
   * Clears all active toasts immediately.
   */
  clear() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = '';
    }
  }

  // Convenience shortcuts
  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }
}

export const notificationService = new NotificationService();
