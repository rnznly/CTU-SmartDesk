/**
 * @file storageService.js
 * @description Data Access Layer: LocalStorage Wrapper.
 * Provides pre-seeded campus records and standard CRUD operations.
 */

import { STORAGE_KEYS, REQUEST_STATUS } from '../config/constants.js';

// Environment-safe storage helper (browser localStorage + Node in-memory fallback)
const memStorage = new Map();
const isBrowserStorage = typeof localStorage !== 'undefined';
const store = {
  getItem: (key) => (isBrowserStorage ? localStorage.getItem(key) : (memStorage.get(key) || null)),
  setItem: (key, val) => (isBrowserStorage ? localStorage.setItem(key, String(val)) : memStorage.set(key, String(val))),
  removeItem: (key) => (isBrowserStorage ? localStorage.removeItem(key) : memStorage.delete(key)),
  clear: () => (isBrowserStorage ? localStorage.clear() : memStorage.clear())
};

/**
 * Pre-seeded realistic CTU campus service request records.
 */
const SEED_REQUESTS = [
  {
    id: 'CTU-REQ-20261109-8F2B01',
    studentName: 'Maria Clara Santos (BSCE 4-A)',
    concernType: 'Classroom Equipment',
    description: 'Room EN-302 (Engineering Bldg): Wall-mounted 65" Smart TV does not detect HDMI input from the lectern laptop during CAD lecture.',
    dateSubmitted: new Date(Date.now() - 3600000 * 3).toISOString(),
    formattedDate: 'Today • 09:15 AM',
    status: REQUEST_STATUS.PENDING,
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'CTU-REQ-20261109-4C9A02',
    studentName: 'Joshua Reyes (BSIT 3-B)',
    concernType: 'Laboratory',
    description: 'ICT Lab 2 (Centennial Bldg 5th Flr): Cisco Catalyst switch rack port #14-18 showing amber link fault; 5 student workstations offline.',
    dateSubmitted: new Date(Date.now() - 3600000 * 5).toISOString(),
    formattedDate: 'Today • 08:40 AM',
    status: REQUEST_STATUS.IN_PROGRESS,
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'CTU-REQ-20261108-7E1D03',
    studentName: 'Engr. Roberto Villanueva (Faculty)',
    concernType: 'Facility Maintenance',
    description: 'Science Bldg Rm 104: Split-type air conditioning unit #2 is dripping condensation water onto the front demonstration table.',
    dateSubmitted: new Date(Date.now() - 3600000 * 24).toISOString(),
    formattedDate: 'Yesterday • 03:20 PM',
    status: REQUEST_STATUS.PENDING,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'CTU-REQ-20261107-2A6F04',
    studentName: 'Angela Mae Gomez (BSED 2-A)',
    concernType: 'Others',
    description: 'CTU Multi-Purpose Hall: Wireless gooseneck podium microphone #1 has intermittent static interference during departmental orientation.',
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
   * Initializes storage with seed data if currently empty.
   * @private
   */
  _initializeSeedData() {
    try {
      const existing = store.getItem(this.storageKey);
      if (!existing || JSON.parse(existing).length === 0) {
        store.setItem(this.storageKey, JSON.stringify(SEED_REQUESTS));
      }
    } catch (error) {
      console.warn('StorageService: Unable to initialize seed data in storage.', error);
    }
  }

  /**
   * Retrieves all requests from storage.
   * @returns {Array<object>}
   */
  getAll() {
    try {
      const raw = store.getItem(this.storageKey);
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

    store.setItem(this.storageKey, JSON.stringify(all));
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
    store.setItem(this.storageKey, JSON.stringify(all));
    return updated;
  }

  /**
   * Resets storage to original seed requests (useful for test resets).
   */
  resetToDefault() {
    store.setItem(this.storageKey, JSON.stringify(SEED_REQUESTS));
    return [...SEED_REQUESTS];
  }
}

export const storageService = new StorageService();
