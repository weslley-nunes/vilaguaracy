const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'app', 'layout.js');
let content = fs.readFileSync(filePath, 'utf8');

// Change lang="en" to lang="pt-BR" translate="no"
content = content.replace(
    '<html lang="en" suppressHydrationWarning>',
    '<html lang="pt-BR" translate="no" suppressHydrationWarning>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Layout updated with lang="pt-BR" and translate="no"');
