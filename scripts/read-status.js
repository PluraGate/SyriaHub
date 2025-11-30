
const fs = require('fs');
const path = require('path');

try {
    const content = fs.readFileSync('status_clean.json', 'utf8');
    console.log(content);
} catch (err) {
    console.error(err);
}
