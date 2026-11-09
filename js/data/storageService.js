/**
 * @file storageService.js
 * @description LocalStorage Repository Gateway.
 * Manages raw JSON persistence, serialization, quota protection,
 * and initial demo seed data.
 */

import { STORAGE_KEYS, REQUEST_STATUS, CONCERN_TYPES } from '../config/constants.js';

/**
 * Initial Seed Data for Demo & Evaluation
 * Provides ready-to-test data on initial load.
 */
const SEED_REQUESTS = [
  {
    id: 'CTU-REQ-20261109-01A1',
    studentName: 'Juan Dela Cruz',
    concernType: CONCERN_TYPES[0], // Classroom Equipment
    description: 'Classroom 304 projector lamp is flickering intermittently and shuts off after 10 minutes of lecture.',
    dateSubmitted: new Date(Date.now() - 3600000 * 5).toISOString(),
    formattedDate: 'Today, 04:30 AM',
    status: REQUEST_STATUS.PENDING,
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'CTU-REQ-20261109-02B2',
    studentName: 'Maria Santos',
    concernType: CONCERN_TYPES[1], // Laboratory
    description: 'Computer terminal #14 in CCIT Computer Lab 2 has no network connectivity and displays IP conflict errors.',
    dateSubmitted: new Date(Date.now() - 3600000 * 24).toISOString(),
    formattedDate: 'Yesterday, 09:15 AM',
    status: REQUEST_STATUS.IN_PROGRESS,
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'CTU-REQ-20261109-03C3',
    studentName: 'Mark Reyes',
    concernType: CONCERN_TYPES[2], // Facility Maintenance
    description: 'Main Building 2nd floor male restroom sink faucet is continuously dripping, causing water wastage.',
    dateSubmitted: new Date(Date.now() - 3600000 * 48).toISOString(),
    formattedDate: '2 days ago',
    status: REQUEST_STATUS.RESOLVED,
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

class StorageService {
  constructor() {
    this.storageKey = STORAGE_KEYS.REQUESTS_STORE;
    this._initializeSeedData();
  }

  /**
   * Initializes local storage with seed data if currently empty.
   * @private
   */
  _initializeSeedData() {
    try {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing || JSON.parse(existing).length === 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(SEED_REQUESTS));
      }
    } catch (error) {
      console.warn('StorageService: Unable to initialize seed data in localStorage.', error);
    }
  }

  /**
   * Retrieves all requests from local storage.
   * @returns {Array<object>}
   */
  getAll() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('StorageService.getAll failed:', error);
      return [];
    }
  }

  /**
   * Finds a single request by its unique ID.
   * @param {string} id
   * @returns {object|null}
   */
  getById(id) {
    if (!id) return null;
    const all = this.getAll();
    return all.find(item => item.id.toLowerCase() === id.trim().toLowerCase()) || null;
  }

  /**
   * Persists a new request object to storage.
   * @param {object} newRequest
   * @returns {object} The saved request
   */
  save(newRequest) {
    if (!newRequest || !newRequest.id) {
      throw new Error('StorageService.save: Valid request entity with unique ID required.');
    }
    const all = this.getAll();
    
    // Safety check: ensure no ID collision
    const existingIndex = all.findIndex(item => item.id === newRequest.id);
    if (existingIndex >= 0) {
      all[existingIndex] = newRequest;
    } else {
      all.unshift(newRequest); // Add newest to the top
    }

    localStorage.setItem(this.storageKey, JSON.stringify(all));
    return newRequest;
  }

  /**
   * Updates an existing request in storage.
   * @param {string} id
   * @param {object} updates
   * @returns {object|null} Updated request or null if not found
   */
  update(id, updates) {
    if (!id) return null;
    const all = this.getAll();
    const index = all.findIndex(item => item.id.toLowerCase() === id.trim().toLowerCase());
    if (index === -1) return null;

    const updated = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    all[index] = updated;
    localStorage.setItem(this.storageKey, JSON.stringify(all));
    return updated;
  }

  /**
   * Resets storage to original seed requests (useful for test resets).
   */
  resetToDefault() {
    localStorage.setItem(this.storageKey, JSON.stringify(SEED_REQUESTS));
    return [...SEED_REQUESTS];
  }
}

export const storageService = new StorageService();
