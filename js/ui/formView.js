/**
 * @file formView.js
 * @description Presentation Layer Form Controller.
 * Handles user input, live character counting, error rendering, form reset,
 * and delegates submission exclusively to RequestService (Passive View Pattern).
 */

import { requestService } from '../services/requestService.js';
import { notificationService } from '../services/notificationService.js';
import { soundService } from '../services/soundService.js';
import { VALIDATION_RULES, CONCERN_TYPES } from '../config/constants.js';

export class FormView {
  /**
   * @param {object} options
   * @param {Function} [options.onRequestSubmitted] - Callback invoked when a request is successfully created
   */
  constructor(options = {}) {
    this.onRequestSubmitted = options.onRequestSubmitted || (() => {});

    // DOM Elements
    this.form = document.getElementById('service-request-form');
    this.nameInput = document.getElementById('student-name');
    this.nameError = document.getElementById('name-error');
    this.typeSelect = document.getElementById('concern-type');
    this.typeError = document.getElementById('type-error');
    this.descInput = document.getElementById('concern-description');
    this.descError = document.getElementById('desc-error');
    this.charCounter = document.getElementById('char-counter');
    this.submitBtn = document.getElementById('btn-submit-request');
    this.sampleFillBtn = document.getElementById('btn-sample-fill');

    this.sampleIndex = 0;
    this.sampleTickets = [
      {
        name: 'Carlos Mendoza (BSIT 4-B)',
        type: 'Classroom Equipment',
        desc: 'Room EN-304: Overhead multimedia projector power lamp blinks red; won\'t display lecture slide output.'
      },
      {
        name: 'Dr. Maria Santos (CIT Faculty)',
        type: 'Laboratory',
        desc: 'Computer Lab 3 Workstation #12: Ethernet RJ-45 cable clip is snapped; packet loss during database practicals.'
      },
      {
        name: 'Janice Dela Cruz (BSCE 2-A)',
        type: 'Facility Maintenance',
        desc: 'Civil Engg Bldg 2nd Floor Hallway: Water dispenser compressor is overheating and leaking onto floor tiles.'
      },
      {
        name: 'Mark Anthony Perez (BSME 3-A)',
        type: 'Others',
        desc: 'Main Student Center: Main breaker box for study kiosk power sockets trips every 30 minutes under load.'
      }
    ];

    this._init();
  }

  /**
   * Initializes event listeners and populates categories dynamically.
   * @private
   */
  _init() {
    if (!this.form) return;

    // 1. Populate category select from constants (ensures single source of truth)
    this._populateCategories();
    this._setupCustomSelect();

    // 2. Live character count & validation styling
    if (this.descInput && this.charCounter) {
      this.descInput.addEventListener('input', () => this._handleDescriptionInput());
    }

    // 3. Clear inline error state on user input
    if (this.nameInput) {
      this.nameInput.addEventListener('input', () => this._clearFieldError(this.nameInput, this.nameError));
    }
    if (this.typeSelect) {
      this.typeSelect.addEventListener('change', () => this._clearFieldError(this.typeSelect, this.typeError));
    }
    if (this.descInput) {
      this.descInput.addEventListener('input', () => this._clearFieldError(this.descInput, this.descError));
    }

    // 4. Form Submit Handler
    this.form.addEventListener('submit', (e) => this._handleSubmit(e));

    // 5. Sample Ticket Auto-fill
    if (this.sampleFillBtn) {
      this.sampleFillBtn.addEventListener('click', () => this._fillSampleTicket());
    }
  }

  /**
   * Sets up sleek Bryl Lim custom select dropdown, enabling choice hover sounds and click pen feedback.
   * Keeps underlying native select perfectly synced for DOM contracts and validation.
   * @private
   */
  _setupCustomSelect() {
    if (!this.typeSelect) return;
    const wrapper = this.typeSelect.closest('.select-wrapper');
    if (!wrapper) return;

    wrapper.classList.add('custom-enabled');
    this.isOpen = false;

    let trigger = wrapper.querySelector('.custom-select-trigger');
    let menu = wrapper.querySelector('.custom-select-menu');

    if (!trigger) {
      trigger = document.createElement('div');
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('tabindex', '0');
      trigger.setAttribute('role', 'combobox');
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      const valSpan = document.createElement('span');
      valSpan.className = 'custom-select-value is-placeholder';
      valSpan.textContent = 'Select category...';
      trigger.appendChild(valSpan);

      const caret = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      caret.setAttribute('class', 'select-chevron');
      caret.setAttribute('viewBox', '0 0 20 20');
      caret.setAttribute('fill', 'currentColor');
      caret.setAttribute('aria-hidden', 'true');
      caret.innerHTML = '<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />';
      trigger.appendChild(caret);

      wrapper.appendChild(trigger);
    }

    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'custom-select-menu';
      menu.setAttribute('role', 'listbox');
      menu.setAttribute('hidden', '');
      menu.style.display = 'none';
      wrapper.appendChild(menu);
    }

    // Populate dropdown options
    menu.innerHTML = '';
    CONCERN_TYPES.forEach((type) => {
      const opt = document.createElement('div');
      opt.className = 'custom-select-option';
      opt.setAttribute('role', 'option');
      opt.setAttribute('data-value', type);
      opt.setAttribute('tabindex', '-1');

      const label = document.createElement('span');
      label.textContent = type;
      opt.appendChild(label);

      const check = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      check.setAttribute('class', 'custom-select-option-check');
      check.setAttribute('viewBox', '0 0 20 20');
      check.setAttribute('fill', 'currentColor');
      check.innerHTML = '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />';
      opt.appendChild(check);

      // Sound on hover: typewriter sound
      opt.addEventListener('pointerenter', () => {
        soundService.playTypewriter();
      });

      // Sound and selection on click: click pen sound
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        soundService.playClickPen();
        this._selectCategory(type);
      });

      menu.appendChild(opt);
    });

    // Toggle on trigger click
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      soundService.playClickPen();
      if (this.isOpen) {
        this._closeCustomSelect();
      } else {
        this._openCustomSelect();
      }
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!this.isOpen) {
          soundService.playClickPen();
          this._openCustomSelect();
        }
      } else if (e.key === 'Escape') {
        this._closeCustomSelect();
      }
    });

    // Close immediately on ANY pointerdown outside
    document.addEventListener('pointerdown', (e) => {
      if (this.isOpen && !wrapper.contains(e.target)) {
        this._closeCustomSelect();
      }
    });

    // Close on Escape anywhere
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this._closeCustomSelect();
      }
    });

    this.typeSelect.addEventListener('change', () => {
      this._syncCustomSelect();
    });

    this.customTrigger = trigger;
    this.customMenu = menu;
    this.customWrapper = wrapper;

    this._syncCustomSelect();
  }

  _openCustomSelect() {
    if (!this.customWrapper || !this.customMenu || !this.customTrigger) return;
    this.isOpen = true;
    this.customWrapper.classList.add('is-open');
    this.customMenu.removeAttribute('hidden');
    this.customMenu.style.display = 'flex';
    this.customTrigger.setAttribute('aria-expanded', 'true');
  }

  _closeCustomSelect() {
    if (!this.customWrapper || !this.customMenu || !this.customTrigger) return;
    this.isOpen = false;
    this.customWrapper.classList.remove('is-open');
    this.customMenu.setAttribute('hidden', '');
    this.customMenu.style.display = 'none';
    this.customTrigger.setAttribute('aria-expanded', 'false');
  }

  _selectCategory(value) {
    if (!this.typeSelect) return;
    this.typeSelect.value = value;
    this.typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    this._closeCustomSelect();
    this._clearFieldError(this.typeSelect, this.typeError);
    if (this.customTrigger) {
      this.customTrigger.focus();
    }
  }

  _syncCustomSelect() {
    if (!this.customTrigger || !this.typeSelect) return;
    const val = this.typeSelect.value;
    const valSpan = this.customTrigger.querySelector('.custom-select-value');
    if (valSpan) {
      if (val) {
        valSpan.textContent = val;
        valSpan.classList.remove('is-placeholder');
      } else {
        valSpan.textContent = 'Select category...';
        valSpan.classList.add('is-placeholder');
      }
    }

    if (this.customMenu) {
      const options = this.customMenu.querySelectorAll('.custom-select-option');
      options.forEach((opt) => {
        const isMatch = opt.getAttribute('data-value') === val;
        opt.classList.toggle('is-selected', isMatch);
        opt.setAttribute('aria-selected', String(isMatch));
      });
    }
  }

  /**
   * Populates concern categories from constants.js
   * @private
   */
  _populateCategories() {
    if (!this.typeSelect) return;

    const currentVal = this.typeSelect.value;
    this.typeSelect.innerHTML = '<option value="">Select category...</option>';

    CONCERN_TYPES.forEach((type) => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      if (type === currentVal) opt.selected = true;
      this.typeSelect.appendChild(opt);
    });
  }

  /**
   * Handles live character counter on description textarea.
   * @private
   */
  _handleDescriptionInput() {
    const len = this.descInput.value.length;
    const min = VALIDATION_RULES.DESCRIPTION.MIN_LENGTH;

    this.charCounter.textContent = `${len} / ${min} min chars`;
    if (len >= min) {
      this.charCounter.classList.add('valid');
    } else {
      this.charCounter.classList.remove('valid');
    }
  }

  /**
   * Auto-fills a realistic test ticket for fast demoing.
   * @private
   */
  _fillSampleTicket() {
    const sample = this.sampleTickets[this.sampleIndex % this.sampleTickets.length];
    this.sampleIndex++;

    this.nameInput.value = sample.name;
    this.typeSelect.value = sample.type;
    this.descInput.value = sample.desc;

    this._clearAllErrors();
    this._syncCustomSelect();
    this._closeCustomSelect();
    this._handleDescriptionInput();
    notificationService.info(`Loaded sample ticket: ${sample.type}`, 2000);
  }

  /**
   * Clears error styling from an individual field.
   * @private
   */
  _clearFieldError(inputElement, errorElement) {
    if (inputElement) inputElement.classList.remove('input-invalid');
    if (inputElement === this.typeSelect && this.customTrigger) {
      this.customTrigger.classList.remove('input-invalid');
    }
    if (errorElement) errorElement.classList.remove('visible');
  }

  /**
   * Clears all validation error displays across the form.
   * @private
   */
  _clearAllErrors() {
    this._clearFieldError(this.nameInput, this.nameError);
    this._clearFieldError(this.typeSelect, this.typeError);
    this._clearFieldError(this.descInput, this.descError);
  }

  /**
   * Displays validation error messages on specific inputs.
   * @param {Record<string, string>} errors
   */
  displayErrors(errors = {}) {
    if (errors.studentName && this.nameInput && this.nameError) {
      this.nameInput.classList.add('input-invalid');
      this.nameError.textContent = errors.studentName;
      this.nameError.classList.add('visible');
    }
    if (errors.concernType && this.typeSelect && this.typeError) {
      this.typeSelect.classList.add('input-invalid');
      if (this.customTrigger) {
        this.customTrigger.classList.add('input-invalid');
      }
      this.typeError.textContent = errors.concernType;
      this.typeError.classList.add('visible');
    }
    if (errors.description && this.descInput && this.descError) {
      this.descInput.classList.add('input-invalid');
      this.descError.textContent = errors.description;
      this.descError.classList.add('visible');
    }
  }

  /**
   * Form submission event handler.
   * Conforms to Technical Challenge B (blocks invalid inputs) and Challenge A (fault tolerance).
   * @private
   * @param {Event} event
   */
  async _handleSubmit(event) {
    event.preventDefault();
    this._clearAllErrors();

    const dto = {
      studentName: this.nameInput ? this.nameInput.value : '',
      concernType: this.typeSelect ? this.typeSelect.value : '',
      description: this.descInput ? this.descInput.value : ''
    };

    // Client-side quick validation check
    const validation = requestService.validate(dto);
    if (!validation.isValid) {
      this.displayErrors(validation.errors);
      notificationService.error('Please correct the highlighted form errors before submitting.');
      return;
    }

    // Set UI loading state
    this._setSubmitting(true);

    try {
      // Delegate to Application Logic Service
      const response = await requestService.submitRequest(dto);

      if (response.success && response.data) {
        // Successful submission
        notificationService.success(`Request created successfully! Assigned ID: ${response.data.id}`);
        this.reset();
        this.onRequestSubmitted(response.data);
      } else {
        // Error response (e.g. 503 Outage or validation fail)
        const errMsg = response.error ? response.error.message : 'Failed to submit service request.';
        notificationService.error(errMsg);

        // If the server returned field-specific errors
        if (response.error && response.error.details) {
          this.displayErrors(response.error.details);
        }
      }
    } catch (err) {
      notificationService.error(`Unexpected error: ${err.message || 'System failure'}`);
    } finally {
      this._setSubmitting(false);
    }
  }

  /**
   * Sets the submit button loading / disabled state.
   * @private
   * @param {boolean} isSubmitting
   */
  _setSubmitting(isSubmitting) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isSubmitting;
    const labelSpan = this.submitBtn.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent = isSubmitting ? 'Submitting Request...' : 'Submit Service Request';
    }
  }

  /**
   * Resets form values and validation state.
   */
  reset() {
    if (this.form) this.form.reset();
    this._clearAllErrors();
    this._syncCustomSelect();
    this._closeCustomSelect();
    if (this.charCounter) {
      this.charCounter.textContent = `0 / ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} min chars`;
      this.charCounter.classList.remove('valid');
    }
  }
}
