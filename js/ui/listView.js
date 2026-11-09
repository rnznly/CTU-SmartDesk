/**
 * @file listView.js
 * @description Presentation Layer Feed & Dashboard Controller.
 * Renders request cards, calculates live metrics, handles search and status filters,
 * clipboard copy, and quick status transitions.
 */

import { requestService } from '../services/requestService.js';
import { notificationService } from '../services/notificationService.js';
import { REQUEST_STATUS, STATUS_STYLE_MAP } from '../config/constants.js';

export class ListView {
  constructor() {
    // DOM Elements
    this.container = document.getElementById('requests-container');
    this.searchInput = document.getElementById('search-input');
    this.clearSearchBtn = document.getElementById('btn-clear-search');
    this.filterContainer = document.getElementById('filter-container');
    this.emptyState = document.getElementById('empty-state-view');
    this.resetFiltersBtn = document.getElementById('btn-reset-filters');

    // Metric Displays
    this.statsTotal = document.getElementById('stats-total');
    this.statsPending = document.getElementById('stats-pending');
    this.statsResolved = document.getElementById('stats-resolved');

    // State
    this.currentStatusFilter = 'All';
    this.currentSearchTerm = '';
    this.cachedRequests = [];

    this._init();
  }

  /**
   * Initializes event listeners and renders filter pills.
   * @private
   */
  _init() {
    // 1. Build Filter Tabs dynamically from REQUEST_STATUS
    this._renderFilterTabs();

    // 2. Search Box Handlers
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.currentSearchTerm = e.target.value.trim();
        if (this.clearSearchBtn) {
          this.clearSearchBtn.classList.toggle('visible', this.currentSearchTerm.length > 0);
        }
        this.render();
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        if (this.searchInput) this.searchInput.value = '';
        this.currentSearchTerm = '';
        this.clearSearchBtn.classList.remove('visible');
        this.render();
      });
    }

    // 3. Reset Filters in Empty State
    if (this.resetFiltersBtn) {
      this.resetFiltersBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // 4. Delegated Event Handling for Request Cards (Copy ID & Status Transitions)
    if (this.container) {
      this.container.addEventListener('click', (e) => this._handleCardInteraction(e));
    }
  }

  /**
   * Generates filter pill buttons dynamically based on central REQUEST_STATUS.
   * This guarantees that changing constants.js to HOTS_REQUEST_STATUS will update
   * the filter tabs immediately without touching UI logic.
   * @private
   */
  _renderFilterTabs() {
    if (!this.filterContainer) return;

    const statuses = ['All', ...Object.values(REQUEST_STATUS)];
    this.filterContainer.innerHTML = '';

    statuses.forEach((status) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('data-status', status);
      btn.textContent = status;
      if (status === this.currentStatusFilter) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.setAttribute('aria-selected', 'false');
      }

      btn.addEventListener('click', () => {
        this.setStatusFilter(status);
      });

      this.filterContainer.appendChild(btn);
    });
  }

  /**
   * Sets active status filter and re-renders.
   * @param {string} status
   */
  setStatusFilter(status) {
    this.currentStatusFilter = status;

    if (this.filterContainer) {
      const buttons = this.filterContainer.querySelectorAll('button');
      buttons.forEach((btn) => {
        const isMatch = btn.getAttribute('data-status') === status;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      });
    }

    this.render();
  }

  /**
   * Resets both search query and status filter to default.
   */
  resetFilters() {
    if (this.searchInput) this.searchInput.value = '';
    this.currentSearchTerm = '';
    if (this.clearSearchBtn) this.clearSearchBtn.classList.remove('visible');
    this.setStatusFilter('All');
  }

  /**
   * Fetches latest data from RequestService and updates the view.
   */
  async reloadData() {
    try {
      const response = await requestService.getRequests();
      if (response.success && Array.isArray(response.data)) {
        this.cachedRequests = response.data;
        this._updateMetrics(this.cachedRequests);
        this.render();
      } else {
        const msg = response.error ? response.error.message : 'Failed to fetch service requests.';
        notificationService.error(msg);
      }
    } catch (err) {
      notificationService.error(`Failed to load requests: ${err.message}`);
    }
  }

  /**
   * Updates metric chips with live counts.
   * @private
   * @param {Array<object>} requests
   */
  _updateMetrics(requests) {
    const total = requests.length;
    const pendingStatus = REQUEST_STATUS.PENDING;
    const resolvedStatus = REQUEST_STATUS.RESOLVED;

    const pendingCount = requests.filter((r) => r.status === pendingStatus).length;
    const resolvedCount = requests.filter((r) => r.status === resolvedStatus).length;

    if (this.statsTotal) this.statsTotal.textContent = total;
    if (this.statsPending) this.statsPending.textContent = pendingCount;
    if (this.statsResolved) this.statsResolved.textContent = resolvedCount;
  }

  /**
   * Resolves the CSS style class for a given status string.
   * @private
   * @param {string} status
   * @returns {string}
   */
  _getStatusStyleClass(status) {
    if (STATUS_STYLE_MAP[status]) {
      return STATUS_STYLE_MAP[status];
    }
    // Dynamic fallback based on status order in REQUEST_STATUS
    const values = Object.values(REQUEST_STATUS);
    if (status === values[0]) return 'status-pending';
    if (status === values[1]) return 'status-in-progress';
    if (status === values[2]) return 'status-resolved';
    return 'status-pending';
  }

  /**
   * Calculates the next status transition and button label.
   * @private
   * @param {string} currentStatus
   * @returns {{ nextStatus: string, label: string } | null}
   */
  _getNextTransition(currentStatus) {
    const [pending, inProgress, resolved] = Object.values(REQUEST_STATUS);

    if (currentStatus === pending) {
      return { nextStatus: inProgress, label: `Start ${inProgress}` };
    }
    if (currentStatus === inProgress) {
      return { nextStatus: resolved, label: `Mark ${resolved}` };
    }
    if (currentStatus === resolved) {
      return { nextStatus: pending, label: `Re-open (${pending})` };
    }
    return null;
  }

  /**
   * Renders the filtered and searched request cards into the container.
   */
  render() {
    if (!this.container) return;

    let filtered = [...this.cachedRequests];

    // 1. Status Filter
    if (this.currentStatusFilter && this.currentStatusFilter !== 'All') {
      filtered = filtered.filter((r) => r.status === this.currentStatusFilter);
    }

    // 2. Search Filter (matches ID, Student Name, Concern Type, Description)
    if (this.currentSearchTerm) {
      const term = this.currentSearchTerm.toLowerCase();
      filtered = filtered.filter((r) => {
        return (
          (r.id && r.id.toLowerCase().includes(term)) ||
          (r.studentName && r.studentName.toLowerCase().includes(term)) ||
          (r.concernType && r.concernType.toLowerCase().includes(term)) ||
          (r.description && r.description.toLowerCase().includes(term))
        );
      });
    }

    // 3. Handle Empty State
    if (filtered.length === 0) {
      this.container.innerHTML = '';
      if (this.emptyState) this.emptyState.classList.add('visible');
      return;
    }

    if (this.emptyState) this.emptyState.classList.remove('visible');

    // 4. Render Cards (Sorted newest first)
    const cardsMarkup = filtered
      .map((req) => this._createCardMarkup(req))
      .join('');

    this.container.innerHTML = cardsMarkup;
  }

  /**
   * Builds the HTML template string for a single request card.
   * @private
   * @param {object} req - ServiceRequest
   * @returns {string}
   */
  _createCardMarkup(req) {
    const statusClass = this._getStatusStyleClass(req.status);
    const transition = this._getNextTransition(req.status);
    const dateDisplay = req.formattedDate || req.createdAt || 'Just now';

    const actionBtnMarkup = transition
      ? `<button type="button" class="btn-status-action" data-action="transition" data-id="${req.id}" data-target-status="${transition.nextStatus}">
           ${transition.label} →
         </button>`
      : '';

    return `
      <article class="request-card" data-id="${req.id}">
        <div class="card-header">
          <div class="id-time-group">
            <span class="request-id-chip">
              ${this._escapeHtml(req.id)}
              <button type="button" class="btn-copy-id" data-action="copy" data-id="${req.id}" title="Copy Request ID" aria-label="Copy Request ID">
                <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12a1.5 1.5 0 01.439 1.061V16.5A1.5 1.5 0 0115.5 18h-7A1.5 1.5 0 017 16.5v-13z" />
                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-.5h-6A2.5 2.5 0 014.5 13.5V6z" />
                </svg>
              </button>
            </span>
            <span class="card-meta-time">${this._escapeHtml(dateDisplay)}</span>
          </div>
          <span class="concern-badge">${this._escapeHtml(req.concernType)}</span>
        </div>

        <div class="student-name-row">
          <h3 class="card-student-name">${this._escapeHtml(req.studentName)}</h3>
        </div>

        <p class="card-description">${this._escapeHtml(req.description)}</p>

        <div class="card-footer">
          <span class="status-badge ${statusClass}">${this._escapeHtml(req.status)}</span>
          <div class="card-actions-group">
            ${actionBtnMarkup}
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Handles delegated clicks inside the card container.
   * @private
   * @param {Event} event
   */
  async _handleCardInteraction(event) {
    const copyBtn = event.target.closest('[data-action="copy"]');
    if (copyBtn) {
      const id = copyBtn.getAttribute('data-id');
      await this._copyToClipboard(id, copyBtn);
      return;
    }

    const actionBtn = event.target.closest('[data-action="transition"]');
    if (actionBtn) {
      const id = actionBtn.getAttribute('data-id');
      const targetStatus = actionBtn.getAttribute('data-target-status');
      await this._transitionRequestStatus(id, targetStatus, actionBtn);
    }
  }

  /**
   * Copies the Request ID to the user's clipboard.
   * @private
   * @param {string} text
   * @param {HTMLElement} btn
   */
  async _copyToClipboard(text, btn) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      btn.classList.add('copied');
      notificationService.info(`Copied ID to clipboard: ${text}`, 2000);
      setTimeout(() => {
        btn.classList.remove('copied');
      }, 1500);
    } catch {
      notificationService.warning(`ID: ${text}`);
    }
  }

  /**
   * Executes a status transition through RequestService.
   * @private
   * @param {string} id
   * @param {string} targetStatus
   * @param {HTMLElement} btn
   */
  async _transitionRequestStatus(id, targetStatus, btn) {
    btn.disabled = true;
    try {
      const response = await requestService.updateStatus(id, targetStatus);
      if (response.success && response.data) {
        notificationService.success(`Ticket ${id} status updated to: ${targetStatus}`);
        await this.reloadData();
      } else {
        const msg = response.error ? response.error.message : 'Failed to update ticket status.';
        notificationService.error(msg);
      }
    } catch (err) {
      notificationService.error(`Error updating ticket: ${err.message}`);
    } finally {
      btn.disabled = false;
    }
  }

  /**
   * Simple HTML escaper to prevent XSS.
   * @private
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
