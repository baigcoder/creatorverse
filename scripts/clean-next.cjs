const fs = require('node:fs');
const path = require('node:path');

const nextDir = path.join(__dirname, '..', 'apps', 'web', '.next');

fs.rmSync(nextDir, { recursive: true, force: true });
console.log(`Removed ${nextDir}`);
