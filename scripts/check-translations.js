#!/usr/bin/env node

/**
 * Translation Coverage Report Script
 * 
 * Compares translation files (en.json vs ar.json) to identify:
 * - Missing keys (exist in source but not in target)
 * - Orphan keys (exist in target but not in source)
 * - Coverage percentage per section and overall
 * 
 * Usage: node scripts/check-translations.js [--verbose] [--fix]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MESSAGES_DIR = path.join(__dirname, '..', 'messages');
const SOURCE_LOCALE = 'en';
const TARGET_LOCALES = ['ar'];

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
    bold: '\x1b[1m',
};

/**
 * Recursively extract all keys from a nested object
 * Returns an array of dot-notation paths (e.g., "Navigation.home")
 */
function extractKeys(obj, prefix = '') {
    let keys = [];

    for (const key of Object.keys(obj)) {
        const fullPath = prefix ? `${prefix}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            // Recurse into nested objects
            keys = keys.concat(extractKeys(obj[key], fullPath));
        } else {
            // Leaf node (string value)
            keys.push(fullPath);
        }
    }

    return keys;
}

/**
 * Get the top-level section from a key path
 */
function getSection(keyPath) {
    return keyPath.split('.')[0];
}

/**
 * Load and parse a JSON translation file
 */
function loadTranslationFile(locale) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

    if (!fs.existsSync(filePath)) {
        console.error(`${colors.red}Error: Translation file not found: ${filePath}${colors.reset}`);
        process.exit(1);
    }

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`${colors.red}Error parsing ${filePath}: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

/**
 * Generate coverage report comparing source and target locales
 */
function generateReport(sourceLocale, targetLocale, verbose = false) {
    console.log(`\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold}  Translation Coverage Report: ${sourceLocale.toUpperCase()} → ${targetLocale.toUpperCase()}${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

    const sourceData = loadTranslationFile(sourceLocale);
    const targetData = loadTranslationFile(targetLocale);

    const sourceKeys = new Set(extractKeys(sourceData));
    const targetKeys = new Set(extractKeys(targetData));

    // Find missing keys (in source but not in target)
    const missingKeys = [...sourceKeys].filter(key => !targetKeys.has(key));

    // Find orphan keys (in target but not in source)
    const orphanKeys = [...targetKeys].filter(key => !sourceKeys.has(key));

    // Calculate per-section statistics
    const sections = new Map();

    for (const key of sourceKeys) {
        const section = getSection(key);
        if (!sections.has(section)) {
            sections.set(section, { total: 0, translated: 0, missing: [] });
        }
        sections.get(section).total++;
        if (targetKeys.has(key)) {
            sections.get(section).translated++;
        } else {
            sections.get(section).missing.push(key);
        }
    }

    // Print section-by-section coverage
    console.log(`${colors.bold}Section Coverage:${colors.reset}\n`);

    const sortedSections = [...sections.entries()].sort((a, b) => {
        const coverageA = (a[1].translated / a[1].total) * 100;
        const coverageB = (b[1].translated / b[1].total) * 100;
        return coverageA - coverageB; // Sort by coverage (lowest first)
    });

    for (const [section, stats] of sortedSections) {
        const percentage = ((stats.translated / stats.total) * 100).toFixed(1);
        const bar = generateProgressBar(stats.translated, stats.total, 20);

        let colorCode = colors.green;
        if (percentage < 100) colorCode = colors.yellow;
        if (percentage < 80) colorCode = colors.red;

        console.log(`  ${section.padEnd(25)} ${bar} ${colorCode}${percentage.padStart(6)}%${colors.reset} (${stats.translated}/${stats.total})`);

        // Show missing keys for this section if verbose
        if (verbose && stats.missing.length > 0) {
            for (const key of stats.missing.slice(0, 5)) {
                console.log(`    ${colors.dim}└─ ${key}${colors.reset}`);
            }
            if (stats.missing.length > 5) {
                console.log(`    ${colors.dim}└─ ... and ${stats.missing.length - 5} more${colors.reset}`);
            }
        }
    }

    // Overall statistics
    const totalKeys = sourceKeys.size;
    const translatedKeys = totalKeys - missingKeys.length;
    const overallPercentage = ((translatedKeys / totalKeys) * 100).toFixed(2);

    console.log(`\n${colors.bold}Overall Statistics:${colors.reset}\n`);
    console.log(`  Total keys in ${sourceLocale.toUpperCase()}:     ${colors.cyan}${totalKeys}${colors.reset}`);
    console.log(`  Translated in ${targetLocale.toUpperCase()}:     ${colors.green}${translatedKeys}${colors.reset}`);
    console.log(`  Missing in ${targetLocale.toUpperCase()}:        ${colors.red}${missingKeys.length}${colors.reset}`);
    console.log(`  Orphan keys in ${targetLocale.toUpperCase()}:    ${colors.yellow}${orphanKeys.length}${colors.reset}`);
    console.log(`  Coverage:              ${colors.bold}${overallPercentage}%${colors.reset}`);

    // List missing keys if verbose
    if (verbose && missingKeys.length > 0) {
        console.log(`\n${colors.bold}${colors.red}Missing Keys (${missingKeys.length}):${colors.reset}\n`);
        for (const key of missingKeys.slice(0, 20)) {
            console.log(`  ${colors.dim}•${colors.reset} ${key}`);
        }
        if (missingKeys.length > 20) {
            console.log(`  ${colors.dim}... and ${missingKeys.length - 20} more${colors.reset}`);
        }
    }

    // List orphan keys if verbose
    if (verbose && orphanKeys.length > 0) {
        console.log(`\n${colors.bold}${colors.yellow}Orphan Keys (${orphanKeys.length}):${colors.reset}\n`);
        for (const key of orphanKeys.slice(0, 10)) {
            console.log(`  ${colors.dim}•${colors.reset} ${key}`);
        }
        if (orphanKeys.length > 10) {
            console.log(`  ${colors.dim}... and ${orphanKeys.length - 10} more${colors.reset}`);
        }
    }

    console.log(`\n${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);

    return {
        sourceLocale,
        targetLocale,
        totalKeys,
        translatedKeys,
        missingKeys,
        orphanKeys,
        sections: Object.fromEntries(sections),
        coveragePercentage: parseFloat(overallPercentage),
    };
}

/**
 * Generate ASCII progress bar
 */
function generateProgressBar(current, total, width = 20) {
    const percentage = current / total;
    const filled = Math.round(percentage * width);
    const empty = width - filled;

    let color = colors.green;
    if (percentage < 1) color = colors.yellow;
    if (percentage < 0.8) color = colors.red;

    return `${color}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}`;
}

/**
 * Generate JSON report for CI/CD integration
 */
function generateJsonReport(reports) {
    const jsonReport = {
        timestamp: new Date().toISOString(),
        reports: reports.map(r => ({
            source: r.sourceLocale,
            target: r.targetLocale,
            totalKeys: r.totalKeys,
            translatedKeys: r.translatedKeys,
            missingCount: r.missingKeys.length,
            orphanCount: r.orphanKeys.length,
            coveragePercentage: r.coveragePercentage,
            missingKeys: r.missingKeys,
            orphanKeys: r.orphanKeys,
        })),
    };

    const reportPath = path.join(__dirname, '..', 'translation-coverage.json');
    fs.writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
    console.log(`${colors.green}JSON report saved to: ${reportPath}${colors.reset}`);
}

// Main execution
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const jsonOutput = args.includes('--json');

console.log(`\n${colors.bold}🌐 Translation Coverage Check${colors.reset}`);
console.log(`${colors.dim}Source: ${SOURCE_LOCALE} | Targets: ${TARGET_LOCALES.join(', ')}${colors.reset}`);

const reports = [];

for (const targetLocale of TARGET_LOCALES) {
    const report = generateReport(SOURCE_LOCALE, targetLocale, verbose);
    reports.push(report);
}

if (jsonOutput) {
    generateJsonReport(reports);
}

// Exit with error code if coverage is below threshold
const threshold = 95;
const allPassed = reports.every(r => r.coveragePercentage >= threshold);

if (!allPassed) {
    console.log(`${colors.yellow}⚠️  Some locales are below ${threshold}% coverage threshold${colors.reset}\n`);
    process.exit(1);
} else {
    console.log(`${colors.green}✅ All locales meet the ${threshold}% coverage threshold${colors.reset}\n`);
    process.exit(0);
}
