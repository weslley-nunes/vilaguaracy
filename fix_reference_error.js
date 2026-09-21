const fs = require('fs');
const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

// The block starts with "const verbDictionary = {"
// And ends with "const usedVerbsList = Array.from(usedVerbs).sort();"

const startIdx = code.indexOf('const verbDictionary = {');
const endIdx = code.indexOf('const usedVerbsList = Array.from(usedVerbs).sort();') + 'const usedVerbsList = Array.from(usedVerbs).sort();'.length;

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find verb block");
    process.exit(1);
}

const verbBlock = code.substring(startIdx, endIdx);
// Remove it from current location
code = code.substring(0, startIdx) + code.substring(endIdx);

// Insert it right before "return ("
const returnIdx = code.indexOf('return (', startIdx); // Find the return statement of the component
if (returnIdx === -1) {
    console.error("Could not find return statement");
    process.exit(1);
}

code = code.substring(0, returnIdx) + verbBlock + '\n\n    ' + code.substring(returnIdx);

fs.writeFileSync(path, code, 'utf8');
console.log("Moved verb block successfully.");
