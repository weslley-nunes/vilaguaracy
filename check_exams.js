const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "vila-guaracy",
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function run() {
    const examsSnapshot = await db.collection('exams').where('bimester', '==', '2º Bimestre').get();
    console.log(`=== EXAMS COUNT: ${examsSnapshot.size} ===`);
    examsSnapshot.forEach(doc => {
        const d = doc.data();
        console.log(`- ID: ${doc.id} | Title: ${d.title}`);
        console.log(`  Collaborators:`, (d.collaborators || []).map(c => `${c.subject} (${c.name})`));
    });
}

run();
