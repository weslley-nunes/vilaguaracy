const fs = require('fs');
const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

const target = '            {/* Questions List Grouped by Blocks */}\n            <div className={spacing}>';
const targetCRLF = '            {/* Questions List Grouped by Blocks */}\r\n            <div className={spacing}>';

if (code.includes(target)) {
    code = code.replace(target, '            {/* Questions List Grouped by Blocks */}\n            <div className={`print:break-before-page ${spacing}`}>');
} else if (code.includes(targetCRLF)) {
    code = code.replace(targetCRLF, '            {/* Questions List Grouped by Blocks */}\r\n            <div className={`print:break-before-page ${spacing}`}>');
} else {
    // try regex
    code = code.replace(/\{\/\* Questions List Grouped by Blocks \*\/\}\s*<div className=\{spacing\}>/, 
        '{/* Questions List Grouped by Blocks */}\n            <div className={`print:break-before-page ${spacing}`}>');
}

fs.writeFileSync(path, code, 'utf8');
console.log("Fixed page break.");
