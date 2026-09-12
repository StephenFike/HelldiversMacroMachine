'use strict';

/**
 * Copies the built executables out of dist/ and into the project root under
 * friendly, unversioned names, so anyone who downloads the folder sees
 * something obviously double-clickable without digging through build output.
 *
 * The names are deliberately stable across versions: rebuilding overwrites the
 * copy in place instead of leaving a trail of stale executables behind.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');

const TARGETS = [
  { match: /-portable\.exe$/i, name: 'Helldivers Macro Machine.exe' },
  { match: /-setup\.exe$/i, name: 'Helldivers Macro Machine Setup.exe' }
];

if (!fs.existsSync(distDir)) {
  console.error('No dist/ directory - run the build first.');
  process.exit(1);
}

const built = fs.readdirSync(distDir).filter((f) => f.toLowerCase().endsWith('.exe'));
let placed = 0;

for (const { match, name } of TARGETS) {
  const source = built.find((f) => match.test(f));
  if (!source) continue;

  const from = path.join(distDir, source);
  const to = path.join(root, name);

  fs.copyFileSync(from, to);
  placed++;

  const mb = (fs.statSync(to).size / 1024 / 1024).toFixed(1);
  console.log(`Placed ${name} in the project root (${mb} MB)`);
}

if (!placed) {
  console.error(`No portable or setup .exe found in dist/ (saw: ${built.join(', ') || 'nothing'})`);
  process.exit(1);
}
