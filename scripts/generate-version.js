const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const version = {
  buildId: crypto.randomUUID(),
  buildTime: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(__dirname, '../public/version.json'),
  JSON.stringify(version)
);

console.log(`[generate-version] Build ID: ${version.buildId}`);
