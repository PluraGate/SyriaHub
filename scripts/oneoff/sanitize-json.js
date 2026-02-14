const fs = require('fs');
const path = require('path');

const files = ['messages/en.json', 'messages/ar.json'];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        // Remove BOM if present
        const cleanContent = content.replace(/^\uFEFF/, '');
        const json = JSON.parse(cleanContent);
        fs.writeFileSync(file, JSON.stringify(json, null, 4));
        console.log(`Sanitized ${file}`);
    } catch (e) {
        console.error(`Error processing ${file}:`, e.message);
    }
});
