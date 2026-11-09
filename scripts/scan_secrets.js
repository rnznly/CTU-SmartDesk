import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const patterns = [
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g },
  { name: 'OpenAI API Key', regex: /sk-[A-Za-z0-9]{20,}/g },
  { name: 'GitHub Classic Token', regex: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}/g },
  { name: 'GitHub Fine-grained PAT', regex: /github_pat_[A-Za-z0-9_]{82}/g },
  { name: 'AWS Access Key ID', regex: /(A3T[A-Z0-9]|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16})/g },
  { name: 'Private Key Header', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/g },
  { name: 'Generic Secret Assignment', regex: /(api_key|apikey|secret|password|auth_token|access_token)\s*[:=]\s*['"][A-Za-z0-9_\-]{12,}['"]/gi },
  { name: 'Bearer Token Header', regex: /Bearer\s+[A-Za-z0-9_\-\.]{20,}/gi },
  { name: 'Standard JWT', regex: /eyJ[A-Za-z0-9-_]{10,}\.eyJ[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}/g }
];

console.log('========================================================');
console.log('   STRICT REPOSITORY & GIT HISTORY CREDENTIAL SCAN      ');
console.log('========================================================\n');

// 1. Scan current repository files
console.log('[1/3] Scanning all tracked repository files...');
const lsFiles = execSync('git ls-files', { cwd: projectRoot, encoding: 'utf8' }).trim().split(/\r?\n/);
let workingFindings = [];

for (const relPath of lsFiles) {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) continue;

  const ext = path.extname(relPath).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.mp3', '.zip', '.pdf', '.woff', '.woff2'].includes(ext)) {
    continue;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  for (const { name, regex } of patterns) {
    const matches = content.match(regex);
    if (matches) {
      workingFindings.push({ file: relPath, type: name, count: matches.length });
    }
  }
}

if (workingFindings.length === 0) {
  console.log('✓ PASS: No API keys or credentials detected in any tracked file.\n');
} else {
  console.error('✕ WARNING: Potential secrets detected in working tree:');
  console.error(workingFindings);
  console.log('');
}

// 2. Scan entire Git commit history (all commits, diffs, and patches ever made)
console.log('[2/3] Scanning entire git history (all commit diffs from initial commit to HEAD)...');
const allCommitsDiff = execSync('git log -p --all', { cwd: projectRoot, encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });

let historyFindings = [];
for (const { name, regex } of patterns) {
  const matches = allCommitsDiff.match(regex);
  if (matches) {
    historyFindings.push({ type: name, count: matches.length, samples: matches.slice(0, 2) });
  }
}

if (historyFindings.length === 0) {
  console.log('✓ PASS: No API keys or credentials detected in ANY git commit or diff in history.\n');
} else {
  console.error('✕ WARNING: Potential secrets detected in commit history:');
  console.error(historyFindings);
  console.log('');
}

// 3. Scan for any untracked or environment files (.env, secrets, etc.)
console.log('[3/3] Checking for untracked environment / sensitive files...');
const allFiles = fs.readdirSync(projectRoot);
const sensitiveFilePatterns = ['.env', '.env.local', 'credentials', 'id_rsa', 'secret', 'token', 'private_key'];
let sensitiveFilesFound = [];

for (const file of allFiles) {
  const lower = file.toLowerCase();
  for (const p of sensitiveFilePatterns) {
    if (lower.includes(p)) {
      sensitiveFilesFound.push(file);
    }
  }
}

if (sensitiveFilesFound.length === 0) {
  console.log('✓ PASS: No .env, credentials, or secret configuration files found.\n');
} else {
  console.log('Note: Found files matching sensitive patterns:', sensitiveFilesFound);
}

console.log('========================================================');
if (workingFindings.length === 0 && historyFindings.length === 0) {
  console.log('RESULT: 100% CLEAN. NO API KEYS OR SECRETS FOUND ANYWHERE.');
} else {
  console.log('RESULT: INVESTIGATION REQUIRED (See findings above).');
}
console.log('========================================================');
