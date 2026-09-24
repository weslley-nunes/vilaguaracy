const fs = require('fs');

const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

const oldRegex = /<\!-- Bubbles Grid -->[\s\S]*?<\!-- END BUBBLES GRID -->/g; 
// I didn't add END BUBBLES GRID, let's find the exact chunk.
