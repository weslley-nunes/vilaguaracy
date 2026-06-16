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
    const collections = await db.listCollections();
    console.log("Collections in DB:");
    for (const col of collections) {
        const snapshot = await col.limit(3).get();
        console.log(`- ${col.id} (${snapshot.size} docs sampled)`);
        snapshot.forEach(doc => {
            console.log(`  [${doc.id}]:`, Object.keys(doc.data()));
        });
    }
}

run();
