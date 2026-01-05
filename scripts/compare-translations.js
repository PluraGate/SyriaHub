import fs from 'fs';

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('messages/ar.json', 'utf8'));

function findIssues(source, target, path = '') {
    const issues = [];

    for (const key in source) {
        const fullPath = path ? `${path}.${key}` : key;
        if (!(key in target)) {
            issues.push({ type: 'MISSING', path: fullPath, en: source[key] });
        } else if (typeof source[key] === 'object' && source[key] !== null) {
            issues.push(...findIssues(source[key], target[key], fullPath));
        } else if (source[key] === target[key] && source[key] !== '' && isNaN(source[key]) && source[key].length > 3) {
            // Same value as English, likely untranslated
            issues.push({ type: 'UNTRANSLATED', path: fullPath, value: source[key] });
        }
    }
    return issues;
}

const issues = findIssues(en, ar);
fs.writeFileSync('translation_issues.json', JSON.stringify(issues, null, 2));

console.log(`Found ${issues.length} potential issues. See translation_issues.json`);
const missing = issues.filter(i => i.type === 'MISSING');
const untranslated = issues.filter(i => i.type === 'UNTRANSLATED');

console.log(`Missing: ${missing.length}`);
console.log(`Untranslated: ${untranslated.length}`);

console.log('\nTop 20 Missing:');
missing.slice(0, 20).forEach(i => console.log(i.path));

console.log('\nTop 20 Untranslated:');
untranslated.slice(0, 20).forEach(i => console.log(i.path));
