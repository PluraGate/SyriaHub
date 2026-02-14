const fs = require('fs');

function fixFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lastBraceIndex = content.lastIndexOf('}');

        if (lastBraceIndex !== -1) {
            const cleanContent = content.substring(0, lastBraceIndex + 1);
            if (cleanContent.length !== content.length) {
                fs.writeFileSync(filePath, cleanContent);
                console.log(`Fixed ${filePath}: Removed ${content.length - cleanContent.length} bytes of garbage.`);
            } else {
                console.log(`${filePath} is already clean.`);
            }
        } else {
            console.error(`Error: No closing brace found in ${filePath}`);
        }
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e.message);
    }
}

fixFile('messages/en.json');
fixFile('messages/ar.json');
