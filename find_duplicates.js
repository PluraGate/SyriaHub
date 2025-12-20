const fs = require('fs');

function findDuplicates(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const keys = {};
    const duplicates = [];

    lines.forEach((line, index) => {
        const match = line.match(/^\s{4}"([^"]+)": \{/);
        if (match) {
            const key = match[1];
            if (keys[key]) {
                duplicates.push({ key, firstLine: keys[key], secondLine: index + 1 });
            } else {
                keys[key] = index + 1;
            }
        }
    });

    if (duplicates.length > 0) {
        console.log('Duplicates found:');
        duplicates.forEach(d => {
            console.log(`Key: ${d.key}, Line 1: ${d.firstLine}, Line 2: ${d.secondLine}`);
        });
    } else {
        console.log('No top-level duplicates found.');
    }
}

console.log('--- ar.json ---');
findDuplicates('c:/Users/AvArc/RiderProjects/SyriaHub/messages/ar.json');
console.log('--- en.json ---');
findDuplicates('c:/Users/AvArc/RiderProjects/SyriaHub/messages/en.json');
