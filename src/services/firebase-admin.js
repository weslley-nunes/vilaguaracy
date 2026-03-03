import "server-only";
import admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        });
        console.log("Firebase Admin Initialized successfully. Project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error);
        console.error("Key Preview:", process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
