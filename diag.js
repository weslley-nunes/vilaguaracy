const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function loadEnv() {
    const envPath = path.join(__dirname, ".env.local");
    if (!fs.existsSync(envPath)) {
        console.error(".env.local not found at", envPath);
        process.exit(1);
    }
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            process.env[key] = value;
        }
    });
}

async function verify() {
    loadEnv();
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
    }

    const db = admin.firestore();
    const snap = await db.collection('exams').get();
    console.log("--- DIAGNÓSTICO DE EXAMES ---");
    console.log("Total encontrado:", snap.size);
    
    snap.docs.forEach((doc, i) => {
        const d = doc.data();
        console.log(`[${i+1}] ID: ${doc.id} | Titulo: ${d.title} | Colaboradores: ${d.collaborators?.length || 0} | Template: ${d.templateType || 'N/A'}`);
    });
}

verify();
