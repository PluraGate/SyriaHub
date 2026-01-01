const { diffWords } = require('diff');

const oldText = 'The quick brown fox jumps over the lazy dog.';
const newText = 'The quick red fox jumps over the lazy cat.';

const diff = diffWords(oldText, newText);

console.log('Diff result:');
diff.forEach((part) => {
    const color = part.added ? 'green' :
        part.removed ? 'red' : 'grey';
    console.log(`[${color}] ${part.value}`);
});

if (diff.length > 1) {
    console.log('SUCCESS: Diff detected changes.');
} else {
    console.error('FAILURE: No diff detected.');
    process.exit(1);
}
