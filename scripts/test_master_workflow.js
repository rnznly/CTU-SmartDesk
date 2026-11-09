/**
 * @file test_master_workflow.js
 * @description End-to-end integration and rubric validation test.
 */

import { requestService } from '../js/services/requestService.js';
import { mockApi } from '../js/data/mockApi.js';
import { storageService } from '../js/data/storageService.js';
import { REQUEST_STATUS, HOTS_REQUEST_STATUS, VALIDATION_RULES, HTTP_STATUS, ERROR_CODES } from '../js/config/constants.js';

// Polyfill localStorage
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
}

let total = 0;
let passed = 0;

function check(testName, condition, info = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✕ [FAIL] ${testName} - ${info}`);
  }
}

async function run() {
  console.log('====================================================');
  console.log('   CTU SmartDesk: Master Workflow & Rubric Audit    ');
  console.log('====================================================\n');

  // 1. Part I: Form Validation (Challenge B)
  console.log('--- 1. Part I & Challenge B: Validation Engine ---');
  const emptyRes = requestService.validate({});
  check('Reject empty submission', !emptyRes.isValid);
  check('Name required error present', !!emptyRes.errors.studentName);
  check('Category required error present', !!emptyRes.errors.concernType);
  check('Description required error present', !!emptyRes.errors.description);

  const shortRes = requestService.validate({
    studentName: 'A',
    concernType: 'Laboratory',
    description: 'Short'
  });
  check('Reject short student name (<2 chars)', !!shortRes.errors.studentName);
  check('Reject short description (<10 chars)', !!shortRes.errors.description);

  const validRes = requestService.validate({
    studentName: 'Juan Dela Cruz',
    concernType: 'Laboratory',
    description: 'ICT Lab 1 computer #5 has intermittent network connectivity.'
  });
  check('Accept valid inputs', validRes.isValid && Object.keys(validRes.errors).length === 0);

  // 2. Part I & HOTS: Submission & Duplicate Description Independent Tracking
  console.log('\n--- 2. Part I & HOTS: Submission & Collision Resistance ---');
  const identicalDesc = 'Room EN-302 Smart TV HDMI port faulty. Projector not connecting.';

  const submit1 = await requestService.submitRequest({
    studentName: 'Student Alpha',
    concernType: 'Classroom Equipment',
    description: identicalDesc
  });

  const submit2 = await requestService.submitRequest({
    studentName: 'Student Beta',
    concernType: 'Classroom Equipment',
    description: identicalDesc
  });

  check('Submit 1 succeeds', submit1.success && !!submit1.data?.id);
  check('Submit 2 succeeds', submit2.success && !!submit2.data?.id);
  check('HOTS: Identical descriptions produce distinct unique IDs', submit1.data.id !== submit2.data.id);
  check('ID conforms to contract pattern CTU-REQ-YYYYMMDD-XXXX', /^CTU-REQ-\d{8}-[0-9A-F]{6}$/i.test(submit1.data.id));

  // 3. Search and Status Filtering
  console.log('\n--- 3. Part I: Search & Dynamic Filtering ---');
  const searchResult = await requestService.getRequests({ searchTerm: 'EN-302' });
  check('Search finds matching records', searchResult.success && searchResult.data.length >= 2);

  const pendingResult = await requestService.getRequests({ status: REQUEST_STATUS.PENDING });
  check('Filter returns pending records', pendingResult.success && pendingResult.data.every(r => r.status === REQUEST_STATUS.PENDING));

  // 4. Lifecycle Status Transitions
  console.log('\n--- 4. Part I: Status Transition Machine ---');
  const targetId = submit1.data.id;
  const updateRes1 = await requestService.updateStatus(targetId, REQUEST_STATUS.IN_PROGRESS);
  check('Transition Pending -> In Progress', updateRes1.success && updateRes1.data.status === REQUEST_STATUS.IN_PROGRESS);

  const updateRes2 = await requestService.updateStatus(targetId, REQUEST_STATUS.RESOLVED);
  check('Transition In Progress -> Resolved', updateRes2.success && updateRes2.data.status === REQUEST_STATUS.RESOLVED);

  // 5. Technical Challenge A: 503 Outage Simulation
  console.log('\n--- 5. Technical Challenge A: 503 Server Outage Fault Tolerance ---');
  const countBefore = storageService.getAll().length;

  mockApi.setSimulateFailure(true);
  check('Outage mode successfully enabled', mockApi.getSimulateFailure() === true);

  const failedSubmit = await requestService.submitRequest({
    studentName: 'Outage Tester',
    concernType: 'Others',
    description: 'This submission should fail gracefully without creating orphan data.'
  });

  check('Outage submission returns failure', !failedSubmit.success);
  check('Outage returns HTTP 503 Service Unavailable', failedSubmit.status === HTTP_STATUS.SERVICE_UNAVAILABLE);
  check('Error code is ERR_SERVER_UNAVAILABLE', failedSubmit.error?.code === ERROR_CODES.SERVER_UNAVAILABLE);

  // Verify no corrupt or false data was saved
  mockApi.setSimulateFailure(false);
  const countAfter = storageService.getAll().length;
  check('Data integrity: Zero ghost records persisted during outage', countBefore === countAfter);

  // 6. Summary
  console.log('\n====================================================');
  console.log(`  Master Workflow Audit: ${passed} / ${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log('====================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Workflow Test Error:', e);
  process.exit(1);
});
