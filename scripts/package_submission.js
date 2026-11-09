/**
 * @file package_submission.js
 * @description Packages Deliverable 1 into a clean, examination-ready ZIP archive.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const zipName = 'MIDTERM_SURNAME_FIRSTNAME.zip';
const zipPath = path.join(projectRoot, zipName);

console.log(`[Packaging] Generating ${zipName}...`);

try {
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Use native tar archive generator (built into Windows 10/11)
  const cmd = 'tar -a -c -f MIDTERM_SURNAME_FIRSTNAME.zip index.html favicon.ico manifest.json service-worker.js css js assets docs README.md';
  execSync(cmd, { cwd: projectRoot, stdio: 'inherit' });

  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    console.log(`✓ [SUCCESS] Created ${zipName} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
} catch (err) {
  console.error('Packaging error:', err);
  process.exit(1);
}
