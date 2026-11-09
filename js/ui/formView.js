/**
 * @file formView.js
 * @description Presentation Layer Form Controller.
 * Handles user input, live character counting, error rendering, form reset,
 * and delegates submission exclusively to RequestService (Passive View Pattern).
 */

import { requestService } from '../services/requestService.js';
import { notificationService } from '../services/notificationService.js';
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
    this._handleDescriptionInput();
    notificationService.info(`Loaded sample ticket: ${sample.type}`, 2000);
  }

  /**
   * Clears error styling from an individual field.
   * @private
   */
  _clearFieldError(inputElement, errorElement) {
    if (inputElement) inputElement.classList.remove('input-invalid');
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
    if (this.charCounter) {
      this.charCounter.textContent = `0 / ${VALIDATION_RULES.DESCRIPTION.MIN_LENGTH} min chars`;
      this.charCounter.classList.remove('valid');
    }
  }
}
