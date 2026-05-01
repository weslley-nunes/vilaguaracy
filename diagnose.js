const admin = require('firebase-admin');
const dotenv = require('dotenv');
const fs = require('fs');
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

async function diagnose() {
    console.log("Diagnosing Firestore...");
    
    console.log("--- CLASSES ---");
    const classes = await db.collection('classes').get();
    classes.forEach(doc => {
        console.log(`Class ID: ${doc.id} - Name: ${doc.data().name} - Teacher: ${doc.data().teacherId} - Students: ${doc.data().students?.length}`);
    });

    console.log("--- USERS ---");
    const users = await db.collection('users').get();
    users.forEach(doc => {
        console.log(`User ID: ${doc.id} - Email: ${doc.data().email} - Role: ${doc.data().role}`);
    });
}

diagnose();
