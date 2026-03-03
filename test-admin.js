const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function loadEnv() {
    const envPath = path.join(__dirname, ".env.local");
    if (!fs.existsSync(envPath)) {
        console.error(".env.local not found at", envPath);
        process.exit(1);
    }
    const content = fs.readFileSync(envPath, "utf8");
    content.split("\n").forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            process.env[key] = value;
        }
    });
}

async function testAdmin() {
    loadEnv();
    console.log("Testing Firebase Admin...");
    console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);

    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
                }),
            });
        }

        const db = admin.firestore();
        console.log("Attempting to write to 'test' collection...");
        const res = await db.collection("test").add({
            message: "Hello from test script",
            timestamp: new Date()
        });
        console.log("Success! Doc ID:", res.id);
        process.exit(0);
    } catch (error) {
        console.error("FAILED:", error);
        process.exit(1);
    }
}

testAdmin();
