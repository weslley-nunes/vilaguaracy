const fs = require('fs');

const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    'className="w-[160px] border-t-2 border-black pt-1 flex flex-col gap-y-3"',
    'className={`border-t-2 border-black pt-1 flex flex-col gap-y-3 ${isAdapted ? \'w-[190px]\' : \'w-[160px]\'}`}'
);

fs.writeFileSync(path, code, 'utf8');
console.log("Width fixed!");
