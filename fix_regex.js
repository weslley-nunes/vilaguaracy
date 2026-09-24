const fs = require('fs');

const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

const oldRegex = 'optStr.replace(/^[a-zA-Z\\d]+[).:-]\\s*/, "");';
const newRegex = 'optStr.replace(/^([a-eA-E]|[ivxlcdmIVXLCDM]{1,4}|\\d{1,2})\\s*[).:-](?:\\s+|$)/, "");';

if (code.includes(oldRegex)) {
    code = code.replace(oldRegex, newRegex);
    fs.writeFileSync(path, code, 'utf8');
    console.log("Replaced successfully!");
} else {
    console.log("Regex not found!");
}
