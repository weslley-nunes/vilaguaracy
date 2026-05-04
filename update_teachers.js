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
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            process.env[key] = value;
        }
    });
}

async function updateTeachers() {
    loadEnv();
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
    const classId = "1uiIUU3vX2Kuwpg3n9Di"; // 72.02

    const mappings = [
        { name: "PAULO HENRIQUE LINO DE ARAUJO", subjects: ["Matemática"] },
        { name: "WALDICLEY DA COSTA SILVA", subjects: ["Educação Física", "Ensino Religioso"] },
        { name: "BARBARA PEREIRA DE SOUSA", subjects: ["Língua Portuguesa"] },
        { name: "ANA CRISTINA DE MENEZES", subjects: ["Ciências"] },
        { name: "FRANCISCO WELLINGTON DE SOUSA COSTA", subjects: ["História"] },
        { name: "PEDRO LUCAS FERREIRA DE CARVALHO", subjects: ["Geografia"] },
        { name: "ROMÁRIO COSME DA SILVA", subjects: ["Arte"] },
        { name: "LUCIVANIA CARVALHO BARCELO", subjects: ["Língua Inglesa"] },
        { name: "JULIMARA CARDOSO DA SILVA LOBO", subjects: ["Libras"] }
    ];

    for (const mapping of mappings) {
        const usersSnap = await db.collection('users')
            .where('name', '==', mapping.name)
            .get();

        if (usersSnap.empty) {
            console.log(`User not found: ${mapping.name}`);
            continue;
        }

        const userDoc = usersSnap.docs[0];
        const userData = userDoc.data();
        
        const currentSubjects = userData.subjects || [];
        const currentClasses = userData.classes || [];

        const updatedSubjects = [...new Set([...currentSubjects, ...mapping.subjects])];
        const updatedClasses = [...new Set([...currentClasses, classId])];

        await userDoc.ref.update({
            subjects: updatedSubjects,
            classes: updatedClasses,
            subject: updatedSubjects[0]
        });

        console.log(`Updated ${mapping.name}: Subjects -> ${mapping.subjects.join(", ")}, Class -> 72.02`);
    }
}

updateTeachers();
