const fs = require('fs');
const path = 'src/app/(dashboard)/builder/page.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    /text: question\.text \|\| "",\r?\n\s*type: question\.type \|\| "multiple_choice",/,
    'text: question.text || "",\n            supportText: question.supportText || "",\n            type: question.type || "multiple_choice",'
);

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed edit support text');
