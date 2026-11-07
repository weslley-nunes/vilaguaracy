import "server-only";
import admin from "firebase-admin";

const initFirebaseAdmin = () => {
    if (!admin.apps.length) {
        const projectId = (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vila-guaracy").trim();
        const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || "").trim().replace(/^["']|["']$/g, "");
        const rawKey = (process.env.FIREBASE_PRIVATE_KEY || "").trim().replace(/^["']|["']$/g, "");
        const privateKey = rawKey.replace(/\\n/g, "\n");

        if (!clientEmail || !privateKey) {
            console.warn("Skipping Firebase Admin initialization (missing env vars).");
            return admin;
        }
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
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
    if (!admin.apps.length) {
        return null;
    }
    return admin.firestore();
};

export const getAuth = () => {
    initFirebaseAdmin();
    if (!admin.apps.length) {
        return null;
    }
    return admin.auth();
};
