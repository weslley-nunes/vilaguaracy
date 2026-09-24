const fs = require('fs');

const path = 'src/app/(dashboard)/backup/page.js';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/\\\${/g, '${');
code = code.replace(/}\\`/g, '}');

fs.writeFileSync(path, code, 'utf8');
