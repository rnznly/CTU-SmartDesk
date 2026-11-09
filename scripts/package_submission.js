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

// Use PowerShell Compress-Archive
const psCommand = `powershell -Command "
  if (Test-Path '${zipPath}') { Remove-Item '${zipPath}' -Force }
  Compress-Archive -Path '${projectRoot}\\index.html', '${projectRoot}\\manifest.json', '${projectRoot}\\service-worker.js', '${projectRoot}\\css', '${projectRoot}\\js', '${projectRoot}\\assets', '${projectRoot}\\docs', '${projectRoot}\\README.md' -DestinationPath '${zipPath}'
"`;

try {
  execSync(psCommand, { stdio: 'inherit' });
  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    console.log(`✓ [SUCCESS] Created ${zipName} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
} catch (err) {
  console.error('Packaging error:', err);
}
