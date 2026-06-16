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

async function inspect() {
    console.log("=== CLASSES ===");
    const classesSnapshot = await db.collection('classes').get();
    classesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Class ID: ${doc.id} | Name: ${data.name} | Keys: ${Object.keys(data).join(', ')}`);
        if (data.teacherId) console.log(`  teacherId: ${data.teacherId}`);
    });

    console.log("\n=== USERS ===");
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`User ID: ${doc.id} | Name: ${data.name} | Email: ${data.email} | Role: ${data.role} | Keys: ${Object.keys(data).join(', ')}`);
        if (data.subjects) console.log(`  subjects: ${JSON.stringify(data.subjects)}`);
        if (data.classes) console.log(`  classes: ${JSON.stringify(data.classes)}`);
    });
}

inspect();
