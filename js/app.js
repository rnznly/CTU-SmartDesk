/**
 * @file app.js
 * @description Master Application Bootstrap & Coordinator (Presenter / Controller Layer).
 * Coordinates FormView, ListView, Service Worker registration, Network state events,
 * and the Technical Challenge A Server Outage switch.
 */

import { FormView } from './ui/formView.js';
import { ListView } from './ui/listView.js';
import { mockApi } from './data/mockApi.js';
import { notificationService } from './services/notificationService.js';

class App {
  constructor() {
    this.formView = null;
    this.listView = null;

    // Outage and Network DOM Elements
    this.outageCheckbox = document.getElementById('toggle-server-failure');
    this.outageWrapper = document.getElementById('outage-wrapper');
    this.networkBadge = document.getElementById('network-status-badge');
    this.networkText = document.getElementById('network-status-text');
  }

  /**
   * Initializes the entire application.
   */
  async init() {
    console.log('[CTU SmartDesk] Initializing Application...');

    // 1. Initialize Views
    this.listView = new ListView();
    this.formView = new FormView({
      onRequestSubmitted: async () => {
        await this.listView.reloadData();
      }
    });

    // 2. Initial Data Load
    await this.listView.reloadData();

    // 3. Technical Challenge A: Setup Server Outage Toggle
    this._setupOutageToggle();

    // 4. Setup Network Online/Offline Listeners
    this._setupNetworkListeners();

    // 5. Part III: Register PWA Service Worker
    this._registerServiceWorker();

    console.log('[CTU SmartDesk] Application ready.');
  }

  /**
   * Technical Challenge A: 503 Server Outage Toggle Switch
   * Binds checkbox to mockApi.setSimulateFailure().
   * @private
   */
  _setupOutageToggle() {
    if (!this.outageCheckbox) return;

    // Initialize toggle state from mockApi
    const isFailureActive = mockApi.getSimulateFailure();
    this.outageCheckbox.checked = isFailureActive;
    if (this.outageWrapper) {
      this.outageWrapper.classList.toggle('active', isFailureActive);
    }

    this.outageCheckbox.addEventListener('change', (e) => {
      const shouldFail = e.target.checked;
      mockApi.setSimulateFailure(shouldFail);

      if (this.outageWrapper) {
        this.outageWrapper.classList.toggle('active', shouldFail);
      }

      if (shouldFail) {
        notificationService.warning(
          'Simulated 503 HTTP Server Outage ACTIVE. Future requests will fail until disabled.',
          5000
        );
      } else {
        notificationService.success(
          'Simulated Server Outage DEACTIVATED. Normal campus operations restored.',
          3500
        );
      }
    });
  }

  /**
   * Handles browser online and offline connection events.
   * @private
   */
  _setupNetworkListeners() {
    const updateNetworkStatus = (isOnline) => {
      if (!this.networkBadge || !this.networkText) return;

      if (isOnline) {
        this.networkBadge.classList.remove('offline');
        this.networkText.textContent = 'Online';
        notificationService.info('Network connection restored.', 2500);
      } else {
        this.networkBadge.classList.add('offline');
        this.networkText.textContent = 'Offline';
        notificationService.warning(
          'You are currently offline. Cached requests are accessible; submissions will require network.',
          6000
        );
      }
    };

    window.addEventListener('online', () => updateNetworkStatus(true));
    window.addEventListener('offline', () => updateNetworkStatus(false));

    // Initial check
    if (!navigator.onLine) {
      updateNetworkStatus(false);
    }
  }

  /**
   * Part III Requirement: Progressive Web App Service Worker Registration
   * Implements Cache-First offline asset loading.
   * @private
   */
  _registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./service-worker.js')
          .then((registration) => {
            console.log('[CTU SmartDesk PWA] Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[CTU SmartDesk PWA] Service Worker registration failed:', error);
          });
      });
    }
  }
}

// Bootstrap on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init().catch((err) => {
    console.error('[CTU SmartDesk] Critical bootstrap failure:', err);
  });
});
