/**
 * @file mockApi.js
 * @description Simulated Asynchronous Data Service & RESTful API Gateway.
 * Enforces unified ApiResponse envelopes, network latency, and
 * the Technical Challenge A Server Failure test harness.
 */

import { storageService } from './storageService.js';
import { createApiSuccess, createApiError } from '../contracts/apiContracts.js';
import { HTTP_STATUS, ERROR_CODES, APP_CONFIG, STORAGE_KEYS } from '../config/constants.js';

const isBrowserStorage = typeof localStorage !== 'undefined';

class MockApi {
  constructor() {
    this.latencyMs = APP_CONFIG.MOCK_NETWORK_LATENCY_MS || 150;
    // Load persisted failure flag if set, or default to false
    this.simulateFailure = isBrowserStorage
      ? localStorage.getItem(STORAGE_KEYS.FAILURE_SIMULATION) === 'true'
      : false;
  }

  /**
   * Helper to simulate asynchronous network latency.
   * @private
   */
  _simulateNetworkDelay() {
    return new Promise(resolve => setTimeout(resolve, this.latencyMs));
  }

  /**
   * Technical Challenge A Test Harness:
   * Sets whether the mock API simulates a server/database outage.
   * @param {boolean} enable
   */
  setSimulateFailure(enable) {
    this.simulateFailure = Boolean(enable);
    if (isBrowserStorage) {
      localStorage.setItem(STORAGE_KEYS.FAILURE_SIMULATION, String(this.simulateFailure));
    }
  }

  /**
   * Checks current failure simulation state.
   * @returns {boolean}
   */
  getSimulateFailure() {
    return this.simulateFailure;
  }

  /**
   * Internal guard that returns a 503 response if simulation is active.
   * @private
   */
  _checkSimulatedOutage() {
    if (this.simulateFailure) {
      return createApiError(
        ERROR_CODES.SERVER_UNAVAILABLE,
        'Server Error (503): Service temporarily unavailable. Simulated server outage is ACTIVE.',
        HTTP_STATUS.SERVICE_UNAVAILABLE
      );
    }
    return null;
  }

  /**
   * GET /api/requests
   * Retrieves all requests with optional status and search filtering.
   * @param {object} [filter]
   * @param {string} [filter.status]
   * @param {string} [filter.searchTerm]
   * @returns {Promise<object>} Standard ApiResponse
   */
  async getAll(filter = {}) {
    await this._simulateNetworkDelay();

    const failureResponse = this._checkSimulatedOutage();
    if (failureResponse) return failureResponse;

    try {
      let requests = storageService.getAll();

      // Apply status filter
      if (filter.status && filter.status !== 'All') {
        requests = requests.filter(item => 
          item.status.toLowerCase() === filter.status.trim().toLowerCase()
        );
      }

      // Apply search term filter (matches ID, studentName, or description)
      if (filter.searchTerm && filter.searchTerm.trim() !== '') {
        const query = filter.searchTerm.trim().toLowerCase();
        requests = requests.filter(item =>
          (item.id && item.id.toLowerCase().includes(query)) ||
          (item.studentName && item.studentName.toLowerCase().includes(query)) ||
          (item.description && item.description.toLowerCase().includes(query))
        );
      }

      return createApiSuccess(requests, HTTP_STATUS.OK);
    } catch (error) {
      return createApiError(
        ERROR_CODES.SERVER_UNAVAILABLE,
        `Failed to retrieve service requests: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/requests/:id
   * Retrieves a single service request by unique ID.
   * @param {string} id
   * @returns {Promise<object>} Standard ApiResponse
   */
  async getById(id) {
    await this._simulateNetworkDelay();

    const failureResponse = this._checkSimulatedOutage();
    if (failureResponse) return failureResponse;

    const request = storageService.getById(id);
    if (!request) {
      return createApiError(
        ERROR_CODES.NOT_FOUND,
        `Service request with ID '${id}' was not found.`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createApiSuccess(request, HTTP_STATUS.OK);
  }

  /**
   * POST /api/requests
   * Persists a new service request entity.
   * @param {object} requestEntity
   * @returns {Promise<object>} Standard ApiResponse
   */
  async save(requestEntity) {
    await this._simulateNetworkDelay();

    const failureResponse = this._checkSimulatedOutage();
    if (failureResponse) return failureResponse;

    try {
      const saved = storageService.save(requestEntity);
      return createApiSuccess(saved, HTTP_STATUS.CREATED);
    } catch (error) {
      return createApiError(
        ERROR_CODES.SERVER_UNAVAILABLE,
        `Storage error: Could not save request. ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * PATCH /api/requests/:id/status
   * Updates an existing request's status.
   * @param {string} id
   * @param {string} newStatus
   * @returns {Promise<object>} Standard ApiResponse
   */
  async updateStatus(id, newStatus) {
    await this._simulateNetworkDelay();

    const failureResponse = this._checkSimulatedOutage();
    if (failureResponse) return failureResponse;

    const updated = storageService.update(id, { status: newStatus });
    if (!updated) {
      return createApiError(
        ERROR_CODES.NOT_FOUND,
        `Cannot update status: Request ID '${id}' not found.`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    return createApiSuccess(updated, HTTP_STATUS.OK);
  }
}

export const mockApi = new MockApi();
