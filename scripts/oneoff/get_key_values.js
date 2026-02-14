
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'));

const keys = [
    "Surveys.addQuestionsHintMobile",
    "Surveys.selectQuestionType",
    "Surveys.cancel",
    "Saved.empty.all"
];

function getValue(obj, path) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
}

keys.forEach(key => {
    console.log(`${key}: ${getValue(en, key)}`);
});
