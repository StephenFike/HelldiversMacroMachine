'use strict';

/**
 * Copies the built installer out of dist/ and into the project root under a
 * friendly, unversioned name, so it is easy to find without digging through
 * build output.
 *
 * The name is deliberately stable across versions: rebuilding overwrites the
 * copy in place instead of leaving a trail of stale installers behind.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const distDir = path.join(root, 'dist');

const TARGETS = [
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
  console.error(`No setup .exe found in dist/ (saw: ${built.join(', ') || 'nothing'})`);
  process.exit(1);
}
