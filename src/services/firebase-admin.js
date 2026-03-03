import "server-only";
import admin from "firebase-admin";

const initFirebaseAdmin = () => {
    if (!admin.apps.length) {
        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            console.warn("Skipping Firebase Admin initialization (missing env vars).");
            return admin;
        }
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                }),
            });
            console.log("Firebase Admin Initialized successfully.");
        } catch (error) {
            console.error("Firebase Admin Initialization Error:", error);
        }
    }
    return admin;
};

export const getDb = () => {
    initFirebaseAdmin();
    return admin.firestore();
};

export const getAuth = () => {
    initFirebaseAdmin();
    return admin.auth();
};
