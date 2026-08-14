import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const jsFiles = [];
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) collect(fullPath);
    else if (entry.name.endsWith('.js')) jsFiles.push(fullPath);
  }
}

collect(join(root, 'js'));
const failures = [];
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${file}\n${result.stderr || result.stdout}`);
}

const index = readFileSync(join(root, 'index.html'), 'utf8');
const requiredAssets = ['js/main.js', 'css/styles.css'];
for (const asset of requiredAssets) if (!index.includes(asset)) failures.push(`Missing asset reference: ${asset}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Lint passed: ${jsFiles.length} JavaScript files checked.`);
