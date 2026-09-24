const fs = require('fs');

const path = 'src/components/Sidebar.js';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('Database')) {
    code = code.replace('ClipboardList, Archive', 'ClipboardList, Archive, Database');
}

// Only add it to 'gestao' role which is the first block
const oldStr = '{ href: "/tutorial", label: "Ajuda & Tutoriais", icon: BookOpen },';
const newStr = '{ href: "/backup", label: "Backup & Restauração", icon: Database },\n            { href: "/tutorial", label: "Ajuda & Tutoriais", icon: BookOpen },';

// Only replace first occurrence (gestão)
code = code.replace(oldStr, newStr);

fs.writeFileSync(path, code, 'utf8');
