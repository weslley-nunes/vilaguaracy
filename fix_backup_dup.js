const fs = require('fs');

const path = 'src/app/api/backup/route.js';
let code = fs.readFileSync(path, 'utf8');

const injection = `
        const bkpSnap = await getDocs(collection(db, 'backups'));
        let backupsList = bkpSnap.docs.map(d => d.data());
        
        if (type === 'Daily' && backupsList.some(b => b.name.startsWith(\`Backup_Daily_\${timestamp.split('T')[0]}\`))) {
            return NextResponse.json({ success: true, message: "Already backed up today" });
        }

        // Fetch data
`;

code = code.replace('// Fetch data', injection);

fs.writeFileSync(path, code, 'utf8');
console.log("Injected duplicate check");
