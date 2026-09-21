const fs = require('fs');

const path = 'src/components/Sidebar.js';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('Archive')) {
    code = code.replace('ClipboardList', 'ClipboardList, Archive');
}

code = code.replace(
    '{ href: "/exams", label: "Todas as Provas", icon: ClipboardList },',
    '{ href: "/exams", label: "Todas as Provas", icon: ClipboardList },\n            { href: "/arquivos", label: "Provas Anteriores", icon: Archive },'
);

code = code.replace(
    '{ href: "/exams", label: "Acompanhamento", icon: FileSearch },',
    '{ href: "/exams", label: "Acompanhamento", icon: FileSearch },\n            { href: "/arquivos", label: "Provas Anteriores", icon: Archive },'
);

code = code.replace(
    '{ href: "/exams", label: "Minhas Avaliações", icon: ClipboardList },',
    '{ href: "/exams", label: "Minhas Avaliações", icon: ClipboardList },\n            { href: "/arquivos", label: "Provas Anteriores", icon: Archive },'
);

fs.writeFileSync(path, code, 'utf8');
console.log('Sidebar updated');
