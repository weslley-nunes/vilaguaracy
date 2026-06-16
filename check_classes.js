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
    const classesSnapshot = await db.collection('classes').get();
    const classes = [];
    classesSnapshot.forEach(doc => {
        classes.push({ id: doc.id, name: doc.data().name });
    });
    console.log("=== CLASSES ===");
    console.log(classes);
}

run();
