/**
 * @file app.js
 * @description Master Application Bootstrap & Coordinator (Presenter / Controller Layer).
 * Coordinates FormView, ListView, Theme Switcher, Service Worker registration, Network state events,
 * and the Technical Challenge A Server Outage switch.
 */

import { FormView } from './ui/formView.js';
import { ListView } from './ui/listView.js';
import { mockApi } from './data/mockApi.js';
import { notificationService } from './services/notificationService.js';
import { InteractiveHalftone } from './ui/interactiveHalftone.js';
import { soundService } from './services/soundService.js';

class App {
  constructor() {
    this.formView = null;
    this.listView = null;
    this.halftone = null;

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

    // 0. Setup Interactive Halftone Canvas (bryllim.com reactive dot grid)
    try {
      this.halftone = new InteractiveHalftone('halftone-canvas');
    } catch (err) {
      console.warn('[CTU SmartDesk] Interactive canvas failed to initialize:', err);
    }

    // 1. Setup Theme Switcher (bryllim.com 3-way System / Light / Dark modes)
    this._setupThemeSwitcher();

    // 1b. Setup UI Sound Engine (Hover ticks & Apple Pay click chimes)
    this._setupSound();

    // 2. Initialize Views
    this.listView = new ListView();
    this.formView = new FormView({
      onRequestSubmitted: async () => {
        await this.listView.reloadData();
      }
    });

    // 3. Initial Data Load
    await this.listView.reloadData();

    // 4. Technical Challenge A: Setup Server Outage Toggle
    this._setupOutageToggle();

    // 5. Setup Network Online/Offline Listeners
    this._setupNetworkListeners();

    // 6. Part III: Register PWA Service Worker
    this._registerServiceWorker();

    console.log('[CTU SmartDesk] Application ready.');
  }

  /**
   * Theme Switcher: bryllim.com 3-Way System / Light / Dark Manager
   * @private
   */
  _setupThemeSwitcher() {
    const systemBtn = document.getElementById('theme-system-btn');
    const lightBtn = document.getElementById('theme-light-btn');
    const darkBtn = document.getElementById('theme-dark-btn');

    let currentPreference = 'system';

    const applyTheme = (themeMode) => {
      let isDark = false;
      if (themeMode === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = themeMode === 'dark';
      }

      document.documentElement.classList.toggle('dark', isDark);

      if (systemBtn) systemBtn.classList.toggle('is-active', themeMode === 'system');
      if (lightBtn) lightBtn.classList.toggle('is-active', themeMode === 'light');
      if (darkBtn) darkBtn.classList.toggle('is-active', themeMode === 'dark');

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#0c0c0f' : '#ffffff');
      }

      if (this.halftone) {
        this.halftone.onThemeChange();
      }

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('smartdesk_theme', themeMode);
        }
      } catch {}
    };

    // Load saved preference
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('smartdesk_theme');
        if (saved && ['system', 'light', 'dark'].includes(saved)) {
          currentPreference = saved;
        }
      }
    } catch {}

    applyTheme(currentPreference);

    if (systemBtn) systemBtn.addEventListener('click', () => { currentPreference = 'system'; applyTheme('system'); });
    if (lightBtn) lightBtn.addEventListener('click', () => { currentPreference = 'light'; applyTheme('light'); });
    if (darkBtn) darkBtn.addEventListener('click', () => { currentPreference = 'dark'; applyTheme('dark'); });

    // Listen to OS theme changes when in system mode
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentPreference === 'system') {
          applyTheme('system');
        }
      });
    }
  }

  /**
   * Sound Engine Controller
   * Binds sound toggle button and starts audio service.
   * @private
   */
  _setupSound() {
    soundService.init();
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        soundService.toggleSound();
      });
    }
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
