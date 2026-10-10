// The plugin tarball is rebuilt from GitHub on every build, so its hash changes.
// Drop it from package-lock.json; everything else stays pinned. Runs after npm install.
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'package-lock.json');
const lock = JSON.parse(fs.readFileSync(file, 'utf8'));
const entry = lock.packages?.['node_modules/strapi-plugin-supertext-translation'];
if (entry?.integrity) {
  delete entry.integrity;
  fs.writeFileSync(file, `${JSON.stringify(lock, null, 2)}\n`);
}
