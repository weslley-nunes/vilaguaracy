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
    const usersSnapshot = await db.collection('users').get();
    const classesSnapshot = await db.collection('classes').get();
    const classMap = {};
    classesSnapshot.forEach(doc => {
        classMap[doc.id] = doc.data().name;
    });

    console.log("=== TEACHERS & ROLES ===");
    usersSnapshot.forEach(doc => {
        const d = doc.data();
        if (d.role === 'professor' || d.role === 'coordenador') {
            const teacherClasses = (d.classes || []).map(cid => classMap[cid] || cid);
            console.log(`Name: ${d.name} (${doc.id})`);
            console.log(`  Role: ${d.role} | Subject: ${d.subject}`);
            console.log(`  Subjects list:`, d.subjects || []);
            console.log(`  Classes:`, teacherClasses);
            console.log("--------------------");
        }
    });
}

run();
