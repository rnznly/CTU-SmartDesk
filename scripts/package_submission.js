/**
 * @file package_submission.js
 * @description Packages Deliverable 1 into a clean, examination-ready ZIP archive.
 * Strictly excludes private rehearsal scripts (such as video-presentation-script.md).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Allow custom surname and firstname from CLI arguments:
// e.g. node scripts/package_submission.js LIM BRYL -> MIDTERM_LIM_BRYL.zip
const args = process.argv.slice(2);
let zipName = 'MIDTERM_SURNAME_FIRSTNAME.zip';
if (args.length >= 2) {
  const surname = args[0].toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const firstname = args[1].toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  zipName = `MIDTERM_${surname}_${firstname}.zip`;
} else if (args.length === 1) {
  zipName = args[0].endsWith('.zip') ? args[0] : `${args[0]}.zip`;
}

const zipPath = path.join(projectRoot, zipName);
const stagingDir = path.join(projectRoot, '.submission_staging');

console.log(`[Packaging] Preparing clean submission archive: ${zipName}...`);

try {
  // Remove existing zip and staging dir
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });

  fs.mkdirSync(stagingDir, { recursive: true });

  // Files/Directories to copy
  const rootFiles = ['index.html', 'favicon.ico', 'manifest.json', 'service-worker.js', 'README.md', 'LICENSE'];
  for (const file of rootFiles) {
    const src = path.join(projectRoot, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(stagingDir, file));
    }
  }

  // Recursive copy directories with exclusions
  function copyDirFiltered(srcDir, destDir, excludeFiles = []) {
    fs.mkdirSync(destDir, { recursive: true });
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      if (excludeFiles.includes(entry.name)) continue;

      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        copyDirFiltered(srcPath, destPath, excludeFiles);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Copy css, js, assets directly
  copyDirFiltered(path.join(projectRoot, 'css'), path.join(stagingDir, 'css'));
  copyDirFiltered(path.join(projectRoot, 'js'), path.join(stagingDir, 'js'));
  copyDirFiltered(path.join(projectRoot, 'assets'), path.join(stagingDir, 'assets'), ['minecraft_click.mp3']);

  // Copy docs EXCLUDING private video script and internal design specs
  copyDirFiltered(
    path.join(projectRoot, 'docs'),
    path.join(stagingDir, 'docs'),
    ['video-presentation-script.md', 'BatCaveDesign.md']
  );

  // Use native tar archive generator built into Windows 10/11
  const cmd = `tar -a -c -f "${zipPath}" *`;
  execSync(cmd, { cwd: stagingDir, stdio: 'inherit' });

  // Clean up staging directory
  fs.rmSync(stagingDir, { recursive: true, force: true });

  if (fs.existsSync(zipPath)) {
    const stats = fs.statSync(zipPath);
    console.log(`✓ [SUCCESS] Created ${zipName} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
} catch (err) {
  console.error('Packaging error:', err);
  if (fs.existsSync(stagingDir)) fs.rmSync(stagingDir, { recursive: true, force: true });
  process.exit(1);
}
