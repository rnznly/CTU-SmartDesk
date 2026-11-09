/**
 * @file notificationService.js
 * @description Accessible Toast Notification & Alert Feedback Manager.
 * Satisfies Part I Requirement 7, Technical Challenge A (Error Feedback),
 * and Technical Challenge B (Validation Alerts).
 */

class NotificationService {
  constructor() {
    this.containerId = 'toast-container';
    this.defaultDuration = 4000;
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
   * Returns an SVG or unicode icon representing the notification type.
   * @private
   * @param {string} type
   * @returns {string}
   */
  _getIcon(type) {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  }

  /**
   * Displays an accessible animated toast banner.
   * @param {string} message - Feedback message to display
   * @param {'success'|'error'|'warning'|'info'} [type='info'] - Visual type
   * @param {number} [durationMs=4000] - Auto-dismiss timeout in milliseconds
   */
  show(message, type = 'info', durationMs = this.defaultDuration) {
    // If run in headless test environment, log to console
    if (typeof document === 'undefined') {
      console.log(`[Notification ${type.toUpperCase()}]: ${message}`);
      return;
    }

    const container = this._getOrCreateContainer();
    if (!container) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    // Toast markup
    toast.innerHTML = `
      <div class="toast-icon">${this._getIcon(type)}</div>
      <div class="toast-content">
        <p class="toast-message">${message}</p>
      </div>
      <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
    `;

    // Handle manual dismiss
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this._dismissToast(toast);
      });
    }

    container.appendChild(toast);

    // Auto-dismiss after duration
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
   */
  _dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 250); // Matches CSS transition duration
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
