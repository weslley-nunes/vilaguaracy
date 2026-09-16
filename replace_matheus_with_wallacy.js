const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const auth = admin.auth();
const db = admin.firestore();

async function main() {
    const matheusId = 'JyAljDrnFCgDWlqg39GYAwZjP4r2';
    const matheusDoc = await db.collection('users').doc(matheusId).get();
    
    if (!matheusDoc.exists) {
        console.error("Matheus doc not found!");
        return;
    }
    const matheusData = matheusDoc.data();
    
    const wallacyName = "WALLACY BORGES FERREIRA";
    const wallacyCpf = "722.581.281-53";
    const wallacyCleanCpf = "72258128153";
    const wallacyEmail = `${wallacyCleanCpf}@vilaguaracy.com.br`;
    const wallacyPassword = "Vila@123";

    let wallacyId;
    
    try {
        // Check if user already exists
        const userRecord = await auth.getUserByEmail(wallacyEmail);
        wallacyId = userRecord.uid;
        console.log("User Wallacy already exists in Auth: ", wallacyId);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.log("Creating user Wallacy in Auth...");
            const userRecord = await auth.createUser({
                email: wallacyEmail,
                password: wallacyPassword,
                displayName: wallacyName
            });
            wallacyId = userRecord.uid;
            console.log("Created Wallacy Auth: ", wallacyId);
        } else {
            throw e;
        }
    }
    
    // Create/Update Firestore document for Wallacy
    await db.collection('users').doc(wallacyId).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: 'professor',
        cpf: wallacyCleanCpf,
        name: wallacyName,
        email: wallacyEmail,
        status: 'ativo',
        subject: 'Geografia',
        subjects: ['Geografia'],
        classes: matheusData.classes || []
    });
    console.log("Created/Updated Wallacy in Firestore users collection.");
    
    // Deactivate Matheus
    await db.collection('users').doc(matheusId).update({ status: 'inativo' });
    console.log("Deactivated Matheus in Firestore users collection.");

    // Update exams
    const examsSnapshot = await db.collection('exams').get();
    let updatedExams = 0;
    
    for (const doc of examsSnapshot.docs) {
        const exam = doc.data();
        let changed = false;
        
        // Update collaborators
        if (exam.collaborators) {
            for (let i = 0; i < exam.collaborators.length; i++) {
                if (exam.collaborators[i].userId === matheusId) {
                    exam.collaborators[i].userId = wallacyId;
                    exam.collaborators[i].name = wallacyName;
                    changed = true;
                }
            }
        }
        
        // Update collaboratorIds
        if (exam.collaboratorIds) {
            const index = exam.collaboratorIds.indexOf(matheusId);
            if (index !== -1) {
                exam.collaboratorIds[index] = wallacyId;
                changed = true;
            }
        }
        
        if (changed) {
            await doc.ref.update({
                collaborators: exam.collaborators,
                collaboratorIds: exam.collaboratorIds
            });
            updatedExams++;
        }
    }
    
    console.log(`Updated ${updatedExams} exams replacing Matheus with Wallacy.`);
    
    // Update populate_3rd_bimester_exams.js
    const fs = require('fs');
    const pathFile = './populate_3rd_bimester_exams.js';
    if (fs.existsSync(pathFile)) {
        let script = fs.readFileSync(pathFile, 'utf8');
        // matheus: { userId: 'JyAljDrnFCgDWlqg39GYAwZjP4r2', name: 'MATHEUS TREPTOW DE AMORIM' },
        script = script.replace(/matheus: \{ userId: 'JyAljDrnFCgDWlqg39GYAwZjP4r2', name: 'MATHEUS TREPTOW DE AMORIM' \}/g, 
            `matheus: { userId: '${wallacyId}', name: '${wallacyName}' }`); // Keeping key 'matheus' in script for simplicity, or we can replace it.
        fs.writeFileSync(pathFile, script, 'utf8');
        console.log("Updated populate script.");
    }
}

main().then(() => {
    console.log("Done.");
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
