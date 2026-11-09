/**
 * @file constants.js
 * @description Central Configuration Contract for SmartDesk Application.
 * Acts as the Single Source of Truth for lifecycle statuses, categories,
 * validation limits, and storage keys.
 * 
 * Modifying the statuses here automatically propagates across all UI components,
 * satisfying the Part II HOTS Challenge & Challenge C (Loose Coupling).
 */

// ==========================================
// 1. REQUEST LIFECYCLE STATUSES
// ==========================================

/**
 * Baseline Request Statuses
 * Set to alternate for HOTS Challenge C:
 *   PENDING: 'Submitted',
 *   IN_PROGRESS: 'Under Review',
 *   RESOLVED: 'Completed'
 */
export const REQUEST_STATUS = Object.freeze({
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved'
});

/**
 * Alternative Status Set for HOTS Challenge Verification
 */
export const HOTS_REQUEST_STATUS = Object.freeze({
  PENDING: 'Submitted',
  IN_PROGRESS: 'Under Review',
  RESOLVED: 'Completed'
});

/**
 * Maps status keys to CSS theme classes for visual badges.
 */
export const STATUS_STYLE_MAP = Object.freeze({
  [REQUEST_STATUS.PENDING]: 'status-pending',
  [REQUEST_STATUS.IN_PROGRESS]: 'status-in-progress',
  [REQUEST_STATUS.RESOLVED]: 'status-resolved'
});

// ==========================================
// 2. CONCERN CATEGORIES
// ==========================================

export const CONCERN_TYPES = Object.freeze([
  'Classroom Equipment',
  'Laboratory',
  'Facility Maintenance',
  'Others'
]);

// ==========================================
// 3. VALIDATION RULES & CONSTRAINTS
// ==========================================

export const VALIDATION_RULES = Object.freeze({
  STUDENT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    REQUIRED_MESSAGE: 'Student name is required.',
    LENGTH_MESSAGE: 'Student name must be between 2 and 100 characters.'
  },
  CONCERN_TYPE: {
    REQUIRED_MESSAGE: 'Please select a concern type.'
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
    REQUIRED_MESSAGE: 'Concern description is required.',
    LENGTH_MESSAGE: 'Description must be at least 10 characters long to ensure clarity.'
  }
});

// ==========================================
// 4. HTTP & ERROR CONTRACT CONSTANTS
// ==========================================

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
});

export const ERROR_CODES = Object.freeze({
  VALIDATION_FAILED: 'ERR_VALIDATION_FAILED',
  NOT_FOUND: 'ERR_NOT_FOUND',
  SERVER_UNAVAILABLE: 'ERR_SERVER_UNAVAILABLE',
  OFFLINE_NO_NETWORK: 'ERR_OFFLINE_NO_NETWORK',
  STORAGE_QUOTA_EXCEEDED: 'ERR_STORAGE_QUOTA_EXCEEDED'
});

// ==========================================
// 5. STORAGE & SYSTEM KEYS
// ==========================================

export const STORAGE_KEYS = Object.freeze({
  REQUESTS_STORE: 'smartdesk_requests_store_v1',
  FAILURE_SIMULATION: 'smartdesk_sim_server_failure'
});

export const APP_CONFIG = Object.freeze({
  APP_NAME: 'CTU SmartDesk',
  APP_VERSION: '1.0.0',
  MOCK_NETWORK_LATENCY_MS: 150
});
