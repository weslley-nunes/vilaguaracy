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

const rules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /classes/{classId} {
      allow read, write: if request.auth != null;
    }
    match /habilidades/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /exams/{docId} {
      allow read, write: if request.auth != null && (
        request.auth.uid == resource.data.teacherId || 
        request.auth.uid in resource.data.collaborators
      );
      allow create: if request.auth != null;
    }
    match /corrections/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
`;

async function updateRules() {
    try {
        await admin.securityRules().releaseFirestoreRulesetFromSource(rules);
        console.log('Rules updated successfully!');
    } catch (error) {
        console.error('Error updating rules:', error);
    }
}

updateRules();
