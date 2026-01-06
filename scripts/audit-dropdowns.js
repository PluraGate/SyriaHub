#!/usr/bin/env node
/**
 * Dropdown Audit Script
 * 
 * This script finds all <select> elements in the codebase and checks if they:
 * 1. Use the .select-input class (HTML selects)
 * 2. Use the Radix UI Select component (recommended)
 * 3. Need to be updated
 * 
 * Usage: node scripts/audit-dropdowns.js
 */

const fs = require('fs');
const path = require('path');

const SEARCH_DIRS = ['app', 'components'];
const EXTENSIONS = ['.tsx', '.ts'];

// Patterns to match
const HTML_SELECT_PATTERN = /<select[\s\S]*?<\/select>/g;
const SELECT_INPUT_CLASS = /className="[^"]*select-input[^"]*"/;
const RADIX_SELECT_PATTERN = /<Select[\s\S]*?<\/Select>/g;

const results = {
    htmlSelectsWithClass: [],
    htmlSelectsWithoutClass: [],
    radixSelects: [],
    total: 0
};

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    // Find HTML selects
    const htmlSelects = content.match(HTML_SELECT_PATTERN) || [];
    htmlSelects.forEach((select, index) => {
        const lineNumber = content.substring(0, content.indexOf(select)).split('\n').length;

        if (SELECT_INPUT_CLASS.test(select)) {
            results.htmlSelectsWithClass.push({
                file: relativePath,
                line: lineNumber,
                snippet: select.substring(0, 100) + '...'
            });
        } else {
            results.htmlSelectsWithoutClass.push({
                file: relativePath,
                line: lineNumber,
                snippet: select.substring(0, 100) + '...'
            });
        }
    });

    // Find Radix UI Selects
    const radixSelects = content.match(RADIX_SELECT_PATTERN) || [];
    if (radixSelects.length > 0) {
        results.radixSelects.push({
            file: relativePath,
            count: radixSelects.length
        });
    }

    results.total += htmlSelects.length;
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                scanDirectory(fullPath);
            }
        } else if (entry.isFile() && EXTENSIONS.includes(path.extname(entry.name))) {
            scanFile(fullPath);
        }
    }
}

// Run the scan
console.log('🔍 Scanning for dropdown elements...\n');

SEARCH_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
        scanDirectory(dir);
    }
});

// Print results
console.log('📊 DROPDOWN AUDIT RESULTS\n');
console.log('='.repeat(80));

console.log(`\n✅ HTML <select> with .select-input class: ${results.htmlSelectsWithClass.length}`);
if (results.htmlSelectsWithClass.length > 0) {
    results.htmlSelectsWithClass.forEach(item => {
        console.log(`   - ${item.file}:${item.line}`);
    });
}

console.log(`\n⚠️  HTML <select> WITHOUT .select-input class: ${results.htmlSelectsWithoutClass.length}`);
if (results.htmlSelectsWithoutClass.length > 0) {
    console.log('\n   These need to be updated:');
    results.htmlSelectsWithoutClass.forEach(item => {
        console.log(`   - ${item.file}:${item.line}`);
        console.log(`     ${item.snippet}`);
    });
}

console.log(`\n🎯 Radix UI Select components: ${results.radixSelects.length} files`);
if (results.radixSelects.length > 0) {
    results.radixSelects.forEach(item => {
        console.log(`   - ${item.file} (${item.count} instances)`);
    });
}

console.log(`\n📈 Total HTML selects found: ${results.total}`);
console.log('\n' + '='.repeat(80));

// Summary and recommendations
console.log('\n💡 RECOMMENDATIONS:\n');

if (results.htmlSelectsWithoutClass.length > 0) {
    console.log(`1. Update ${results.htmlSelectsWithoutClass.length} HTML select(s) to use .select-input class`);
    console.log('   Add className="select-input" to each <select> element\n');
}

if (results.htmlSelectsWithClass.length > 0) {
    console.log(`2. Consider migrating ${results.htmlSelectsWithClass.length} HTML select(s) to Radix UI Select`);
    console.log('   For better dark mode consistency and accessibility\n');
}

console.log('3. Reference implementation: components/admin/SearchAnalytics.tsx');
console.log('   Uses Radix UI Select with perfect dark mode styling\n');

// Exit with error if there are selects without the class
process.exit(results.htmlSelectsWithoutClass.length > 0 ? 1 : 0);
