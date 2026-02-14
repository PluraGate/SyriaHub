
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));

function findMissing(obj1, obj2, path = '') {
    let missing = [];
    for (const key in obj1) {
        const currentPath = path ? `${path}.${key}` : key;
        if (obj2[key] === undefined) {
            missing.push(currentPath);
        } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
            missing = missing.concat(findMissing(obj1[key], obj2[key], currentPath));
        }
    }
    return missing;
}

const missingKeys = findMissing(en, ar);
console.log('Missing Keys:', JSON.stringify(missingKeys, null, 2));
