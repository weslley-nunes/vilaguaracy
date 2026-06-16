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

async function inspectExams() {
    console.log("=== EXAMS ===");
    const snapshot = await db.collection('exams').get();
    console.log(`Total exams found: ${snapshot.size}`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Exam ID: ${doc.id}`);
        console.log(`  Title: ${data.title}`);
        console.log(`  Bimester: ${data.bimester}`);
        console.log(`  Class: ${data.className} (${data.classId})`);
        console.log(`  Teacher: ${data.teacherName} (${data.teacherId})`);
        console.log(`  Collaborators:`, data.collaborators);
        console.log(`  CollaboratorIds:`, data.collaboratorIds);
        console.log(`  Questions count: ${data.questions ? data.questions.length : 0}`);
        console.log("----------------------------------------");
    });
}

inspectExams();
