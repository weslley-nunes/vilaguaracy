const fs = require('fs');
const path = 'src/app/(dashboard)/builder/page.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    'text: question.text || "",\n            type: question.type || "multiple_choice",',
    'text: question.text || "",\n            supportText: question.supportText || "",\n            type: question.type || "multiple_choice",'
);

// Wait, let's also check if `openManualModal` lacks supportText clearing!
code = code.replace(
    'setManualQuestion({ text: "", imageUrl: "", imageSize: "medium", type: "multiple_choice", options: ["", "", "", ""], correct: "" });',
    'setManualQuestion({ text: "", supportText: "", imageUrl: "", imageSize: "medium", type: "multiple_choice", options: ["", "", "", ""], correct: "" });'
);

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed edit support text');
