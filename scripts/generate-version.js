const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const buildId = crypto.randomUUID();

// 1. Write version.json for client-side polling
const version = {
  buildId,
  buildTime: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(__dirname, '../public/version.json'),
  JSON.stringify(version)
);

// 2. Inject build ID into sw.js so the browser detects a new service worker
//    on every deploy, triggering cache cleanup via the activate handler.
const swPath = path.join(__dirname, '../public/sw.js');
let sw = fs.readFileSync(swPath, 'utf-8');
sw = sw.replace(
  /const CACHE_VERSION = '.*'/,
  `const CACHE_VERSION = '${buildId}'`
);
fs.writeFileSync(swPath, sw);

console.log(`[generate-version] Build ID: ${buildId}`);
