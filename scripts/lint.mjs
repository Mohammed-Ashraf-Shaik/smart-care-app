import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { spawnSync } from 'child_process';

function getFiles(dir, files = []) {
    try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
            const fullPath = join(dir, entry);
            if (statSync(fullPath).isDirectory()) {
                getFiles(fullPath, files);
            } else if (extname(fullPath) === '.js') {
                files.push(fullPath);
            }
        }
    } catch {}
    return files;
}

const jsFiles = getFiles('js');
let errors = 0;

for (const file of jsFiles) {
    const res = spawnSync('node', ['--check', file], { encoding: 'utf8' });
    if (res.status !== 0) {
        console.error(`Lint error in ${file}:\n${res.stderr}`);
        errors++;
    }
}

if (errors === 0) {
    console.log(`Lint passed: ${jsFiles.length} JavaScript files checked.`);
    process.exit(0);
} else {
    console.error(`Lint failed with ${errors} error(s).`);
    process.exit(1);
}
