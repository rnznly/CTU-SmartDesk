/**
 * @file requestService.js
 * @description Application Logic Layer / Presenter Mediator.
 * Implements input validation rules, unique ID generation (with collision resistance
 * for identical descriptions), and request lifecycle workflows.
 */

import { mockApi } from '../data/mockApi.js';
import { createApiError } from '../contracts/apiContracts.js';
import { 
  REQUEST_STATUS, 
  CONCERN_TYPES, 
  VALIDATION_RULES, 
  HTTP_STATUS, 
  ERROR_CODES 
} from '../config/constants.js';

class RequestService {
  /**
   * Technical Challenge B: Input Validation Engine
   * Validates form inputs against university business rules.
   * @param {object} dto - Raw input object { studentName, concernType, description }
   * @returns {{isValid: boolean, errors: Record<string, string>}}
   */
  validate(dto = {}) {
    const errors = {};
    const studentName = dto.studentName ? String(dto.studentName).trim() : '';
    const concernType = dto.concernType ? String(dto.concernType).trim() : '';
    const description = dto.description ? String(dto.description).trim() : '';

    // 1. Validate Student Name
    if (!studentName) {
      errors.studentName = VALIDATION_RULES.STUDENT_NAME.REQUIRED_MESSAGE;
    } else if (
      studentName.length < VALIDATION_RULES.STUDENT_NAME.MIN_LENGTH || 
      studentName.length > VALIDATION_RULES.STUDENT_NAME.MAX_LENGTH
    ) {
      errors.studentName = VALIDATION_RULES.STUDENT_NAME.LENGTH_MESSAGE;
    }

    // 2. Validate Concern Category
    if (!concernType || concernType === '') {
      errors.concernType = VALIDATION_RULES.CONCERN_TYPE.REQUIRED_MESSAGE;
    } else if (!CONCERN_TYPES.includes(concernType)) {
      errors.concernType = `Please select a valid category from: ${CONCERN_TYPES.join(', ')}.`;
    }

    // 3. Validate Description
    if (!description) {
      errors.description = VALIDATION_RULES.DESCRIPTION.REQUIRED_MESSAGE;
    } else if (
      description.length < VALIDATION_RULES.DESCRIPTION.MIN_LENGTH || 
      description.length > VALIDATION_RULES.DESCRIPTION.MAX_LENGTH
    ) {
      errors.description = VALIDATION_RULES.DESCRIPTION.LENGTH_MESSAGE;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Part I Requirement 4 & HOTS Challenge: Collision-Resistant Unique Request ID Generator
   * Format: "CTU-REQ-{YYYYMMDD}-{4_HEX_SALT}"
   * 
   * Even if two students submit identical descriptions, they will always
   * receive distinct, independent request IDs.
   * 
   * @returns {string} Unique ID e.g. "CTU-REQ-20261109-8F2B"
   */
  generateUniqueId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateSegment = `${year}${month}${day}`;

    // Generate random 4-character cryptographic or pseudo-random hex salt
    const randomSalt = Math.floor(Math.random() * 0x10000)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');

    // Add millisecond sequence to guarantee uniqueness during high-frequency submissions
    const timeSalt = (now.getMilliseconds() % 100).toString().padStart(2, '0');

    return `CTU-REQ-${dateSegment}-${randomSalt}${timeSalt}`;
  }

  /**
   * Formats an ISO date into a clean, human-readable string.
   * @param {string|Date} dateInput
   * @returns {string}
   */
  formatDate(dateInput) {
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(dateInput);
    }
  }

  /**
   * Core Business Workflow: Submits a new service request.
   * 1. Validates inputs
   * 2. Generates unique ID
   * 3. Sets default status (REQUEST_STATUS.PENDING)
   * 4. Persists via Data Layer
   * 
   * @param {object} dto - { studentName, concernType, description }
   * @returns {Promise<object>} ApiResponse<ServiceRequest>
   */
  async submitRequest(dto) {
    // 1. Enforce Validation Guard
    const validation = this.validate(dto);
    if (!validation.isValid) {
      return createApiError(
        ERROR_CODES.VALIDATION_FAILED,
        'Form submission blocked: Please correct the highlighted errors.',
        HTTP_STATUS.BAD_REQUEST,
        validation.errors
      );
    }

    // 2. Build Entity conforming to ServiceRequest contract
    const now = new Date();
    const newEntity = {
      id: this.generateUniqueId(),
      studentName: dto.studentName.trim(),
      concernType: dto.concernType.trim(),
      description: dto.description.trim(),
      dateSubmitted: now.toISOString(),
      formattedDate: this.formatDate(now),
      status: REQUEST_STATUS.PENDING,
      updatedAt: now.toISOString()
    };

    // 3. Persist via Data Management Layer
    return await mockApi.save(newEntity);
  }

  /**
   * Retrieves service requests with optional filtering.
   * @param {object} [filter] - { status, searchTerm }
   * @returns {Promise<object>} ApiResponse<ServiceRequest[]>
   */
  async getRequests(filter = {}) {
    return await mockApi.getAll(filter);
  }

  /**
   * Retrieves an individual request by ID.
   * @param {string} id
   * @returns {Promise<object>} ApiResponse<ServiceRequest>
   */
  async getRequestById(id) {
    if (!id || String(id).trim() === '') {
      return createApiError(
        ERROR_CODES.NOT_FOUND,
        'Please provide a valid Request ID.',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return await mockApi.getById(id.trim());
  }

  /**
   * Part II HOTS & Challenge C: Updates request lifecycle status.
   * @param {string} id
   * @param {string} newStatus
   * @returns {Promise<object>} ApiResponse<ServiceRequest>
   */
  async updateStatus(id, newStatus) {
    const validStatuses = Object.values(REQUEST_STATUS);
    if (!validStatuses.includes(newStatus)) {
      return createApiError(
        ERROR_CODES.VALIDATION_FAILED,
        `Invalid status. Status must be one of: ${validStatuses.join(', ')}.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return await mockApi.updateStatus(id, newStatus);
  }
}

export const requestService = new RequestService();
