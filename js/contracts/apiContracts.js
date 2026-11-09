/**
 * @file apiContracts.js
 * @description Executable API Contracts & Standardized Response Factory.
 * Enforces unified ApiResponse and ApiError schemas across all tiers.
 */

import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';

/**
 * Standard ApiResponse Constructor
 * @template T
 * @param {boolean} success - Operation success flag
 * @param {number} status - HTTP status code
 * @param {T|null} data - Payload data or null
 * @param {object|null} error - Error descriptor or null
 * @returns {{success: boolean, status: number, data: T|null, error: object|null, meta: object}}
 */
export function createApiResponse(success, status, data = null, error = null) {
  return {
    success: Boolean(success),
    status: Number(status),
    data: data !== undefined ? data : null,
    error: error ? {
      code: error.code || ERROR_CODES.SERVER_UNAVAILABLE,
      message: error.message || 'An unexpected error occurred.',
      fieldErrors: error.fieldErrors || null,
      timestamp: new Date().toISOString()
    } : null,
    meta: {
      timestamp: new Date().toISOString(),
      ...(Array.isArray(data) ? { count: data.length } : {})
    }
  };
}

/**
 * Factory for successful API responses
 * @template T
 * @param {T} data - Data to wrap
 * @param {number} status - HTTP status (defaults to 200 OK)
 */
export function createApiSuccess(data, status = HTTP_STATUS.OK) {
  return createApiResponse(true, status, data, null);
}

/**
 * Factory for error API responses
 * @param {string} code - Error code identifier
 * @param {string} message - Human-readable error message
 * @param {number} status - HTTP status code
 * @param {Record<string, string>|null} fieldErrors - Optional field-level error messages
 */
export function createApiError(code, message, status = HTTP_STATUS.BAD_REQUEST, fieldErrors = null) {
  return createApiResponse(false, status, null, {
    code,
    message,
    fieldErrors
  });
}
