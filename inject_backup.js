const fs = require('fs');

const path = 'src/app/(dashboard)/layout.js';
let code = fs.readFileSync(path, 'utf8');

const injection = `
    useEffect(() => {
        // Automatic Backup Trigger Logic
        const triggerBackups = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];
                const lastCheck = localStorage.getItem('lastDailyBackup');
                if (lastCheck !== today) {
                    localStorage.setItem('lastDailyBackup', today);
                    await fetch('/api/backup', { method: 'POST', body: JSON.stringify({ type: 'Daily' }) }).catch(e => console.error(e));
                }

                // Simulate update backup by checking an arbitrary version hash
                const CURRENT_APP_VERSION = "v1.2"; // Change this string on major updates
                const lastUpdateBackup = localStorage.getItem('lastUpdateBackup');
                if (lastUpdateBackup !== CURRENT_APP_VERSION) {
                    localStorage.setItem('lastUpdateBackup', CURRENT_APP_VERSION);
                    await fetch('/api/backup', { method: 'POST', body: JSON.stringify({ type: 'Update' }) }).catch(e => console.error(e));
                }
            } catch(e) {}
        };
        
        // Run lightly in background
        if (user) {
            setTimeout(triggerBackups, 3000);
        }
    }, [user]);
`;

code = code.replace(
    'if (loading || !user) return null;',
    injection + '\n    if (loading || !user) return null;'
);

fs.writeFileSync(path, code, 'utf8');
