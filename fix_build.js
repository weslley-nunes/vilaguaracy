const fs = require('fs');

// Fix API Route
const routePath = 'src/app/api/backup/route.js';
let routeCode = fs.readFileSync(routePath, 'utf8');

// Replace the second declaration
routeCode = routeCode.replace(
    "const bkpSnap = await getDocs(collection(db, 'backups'));\n        let backupsList = bkpSnap.docs.map(d => d.data());",
    "const bkpSnap2 = await getDocs(collection(db, 'backups'));\n        let backupsList2 = bkpSnap2.docs.map(d => d.data());"
);
// Now we also need to fix where backupsList was used for sorting and deleting
routeCode = routeCode.replace(
    "backupsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));",
    "backupsList2.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));"
);
routeCode = routeCode.replace(
    "if (backupsList.length > 5) {\n            const toDelete = backupsList.slice(5);",
    "if (backupsList2.length > 5) {\n            const toDelete = backupsList2.slice(5);"
);

fs.writeFileSync(routePath, routeCode, 'utf8');

// Fix Frontend Page
const pagePath = 'src/app/(dashboard)/backup/page.js';
let pageCode = fs.readFileSync(pagePath, 'utf8');

// 1. In message banner
pageCode = pageCode.replace(
    "bg-blue-100 text-blue-700'}}",
    "bg-blue-100 text-blue-700'}`}"
);

// 2. In badge
pageCode = pageCode.replace(
    "bg-purple-100 text-purple-700'}}>",
    "bg-purple-100 text-purple-700'}`}>"
);

fs.writeFileSync(pagePath, pageCode, 'utf8');
console.log('Fixed build errors');
