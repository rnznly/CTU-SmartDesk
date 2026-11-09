/**
 * @file test_presentation.js
 * @description Comprehensive automated audit of the UI layer, contracts,
 * HTML DOM identifiers, and PWA configuration for CTU SmartDesk.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Polyfill localStorage for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const memStore = new Map();
  globalThis.localStorage = {
    getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
    setItem: (k, v) => memStore.set(k, String(v)),
    removeItem: (k) => memStore.delete(k),
    clear: () => memStore.clear()
  };
}

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✕ FAIL: ${testName} - ${details}`);
  }
}

console.log('====================================================');
console.log('  CTU SmartDesk: Presentation & PWA Master Audit    ');
console.log('====================================================\n');

// 1. File Existence Audit
console.log('--- 1. File Structure & Delivery Verification ---');
const requiredFiles = [
  'index.html',
  'manifest.json',
  'service-worker.js',
  'css/styles.css',
  'css/components.css',
  'js/app.js',
  'js/config/constants.js',
  'js/contracts/apiContracts.js',
  'js/data/mockApi.js',
  'js/data/storageService.js',
  'js/services/requestService.js',
  'js/services/notificationService.js',
  'js/ui/formView.js',
  'js/ui/listView.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'docs/contracts.md',
  'docs/api-contracts.md',
  'docs/architecture-diagram.md',
  'docs/implementation-blueprint.md',
  'docs/usability-testing.md'
];

requiredFiles.forEach((file) => {
  const filePath = path.join(projectRoot, file);
  assert(fs.existsSync(filePath), `File exists: ${file}`);
});

// 2. DOM Contract Audit (index.html)
console.log('\n--- 2. DOM Contract Audit (index.html) ---');
const htmlContent = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

const requiredIds = [
  'app-header',
  'network-status-badge',
  'network-status-text',
  'toggle-server-failure',
  'outage-wrapper',
  'service-request-form',
  'student-name',
  'name-error',
  'concern-type',
  'type-error',
  'concern-description',
  'desc-error',
  'char-counter',
  'btn-submit-request',
  'btn-sample-fill',
  'search-input',
  'btn-clear-search',
  'stats-total',
  'stats-pending',
  'stats-resolved',
  'filter-container',
  'requests-container',
  'empty-state-view',
  'btn-reset-filters',
  'toast-container'
];

requiredIds.forEach((id) => {
  const hasId = htmlContent.includes(`id="${id}"`);
  assert(hasId, `DOM Contract: #${id} is present in index.html`);
});

// 3. PWA Manifest Audit
console.log('\n--- 3. PWA Manifest & Service Worker Audit ---');
const manifestContent = JSON.parse(fs.readFileSync(path.join(projectRoot, 'manifest.json'), 'utf8'));
assert(manifestContent.name.includes('CTU SmartDesk'), 'Manifest contains app name');
assert(manifestContent.display === 'standalone', 'Manifest display mode is standalone');
assert(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 2, 'Manifest defines 192 and 512 icons');

const swContent = fs.readFileSync(path.join(projectRoot, 'service-worker.js'), 'utf8');
assert(swContent.includes('addEventListener(\'install\''), 'Service worker handles install event');
assert(swContent.includes('addEventListener(\'activate\''), 'Service worker handles activate event');
assert(swContent.includes('addEventListener(\'fetch\''), 'Service worker handles fetch event (Cache-First)');

// 4. Design System Token Audit (Bryl Lim Minimalist Monochrome + Halftone)
console.log('\n--- 4. Bryl Lim Design System Token Audit ---');
const stylesContent = fs.readFileSync(path.join(projectRoot, 'css/styles.css'), 'utf8');
assert(stylesContent.includes('--bg:'), 'CSS variable --bg present');
assert(stylesContent.includes('--ink:'), 'CSS variable --ink present');
assert(stylesContent.includes('--g200:'), 'Neutral gray token --g200 present');
assert(stylesContent.includes('.halftone'), 'Bryl Lim Halftone dot field present');
assert(stylesContent.includes('Geist'), 'Geist typography present');
assert(stylesContent.includes('#7B1113'), 'CTU Maroon brand accent #7B1113 present');

// 5. JavaScript Syntax & Export Integrity
console.log('\n--- 5. Module Export Integrity Audit ---');
import('../js/config/constants.js').then((constants) => {
  assert(typeof constants.REQUEST_STATUS === 'object', 'constants.REQUEST_STATUS exported');
  assert(typeof constants.HOTS_REQUEST_STATUS === 'object', 'constants.HOTS_REQUEST_STATUS exported');
  assert(Array.isArray(constants.CONCERN_TYPES), 'constants.CONCERN_TYPES exported');

  return import('../js/services/requestService.js');
}).then((reqServ) => {
  assert(typeof reqServ.requestService.submitRequest === 'function', 'requestService.submitRequest available');
  assert(typeof reqServ.requestService.validate === 'function', 'requestService.validate available');
  assert(typeof reqServ.requestService.generateUniqueId === 'function', 'requestService.generateUniqueId available');

  return import('../js/data/mockApi.js');
}).then((mock) => {
  assert(typeof mock.mockApi.setSimulateFailure === 'function', 'mockApi.setSimulateFailure available (Challenge A)');
  assert(typeof mock.mockApi.getAll === 'function', 'mockApi.getAll available');

  console.log('\n====================================================');
  console.log(`  Audit Completed: ${passedTests} / ${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}).catch((err) => {
  console.error('Fatal Module Import Error:', err);
  process.exit(1);
});
