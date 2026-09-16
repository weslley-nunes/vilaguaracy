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
    const oldTeacherId = 'lpxciCLQVmeRfThmcQ77aUv7nsI2'; // Lucivania Carvalho Barcelo
    const oldTeacherDoc = await db.collection('users').doc(oldTeacherId).get();
    
    if (!oldTeacherDoc.exists) {
        console.error("Old teacher doc not found!");
        // We might continue if it doesn't exist but we need the classes
    }
    const oldTeacherData = oldTeacherDoc.exists ? oldTeacherDoc.data() : { classes: [] };
    
    const newName = "WESLANNE DOS SANTOS GOMES SAMPAIO";
    const newCpf = "013.552.471-79";
    const newCleanCpf = "01355247179";
    const newEmail = `${newCleanCpf}@vilaguaracy.com.br`;
    const newPassword = "Vila@123";

    let newId;
    
    try {
        const userRecord = await auth.getUserByEmail(newEmail);
        newId = userRecord.uid;
        console.log("User Weslanne already exists in Auth: ", newId);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.log("Creating user Weslanne in Auth...");
            const userRecord = await auth.createUser({
                email: newEmail,
                password: newPassword,
                displayName: newName
            });
            newId = userRecord.uid;
            console.log("Created Weslanne Auth: ", newId);
        } else {
            throw e;
        }
    }
    
    // Create/Update Firestore document for Weslanne
    await db.collection('users').doc(newId).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: 'professor',
        cpf: newCleanCpf,
        name: newName,
        email: newEmail,
        status: 'ativo',
        subject: 'Língua Inglesa',
        subjects: ['Língua Inglesa'],
        classes: oldTeacherData.classes || []
    });
    console.log("Created/Updated Weslanne in Firestore users collection.");
    
    // Deactivate Lucivania
    if (oldTeacherDoc.exists) {
        await db.collection('users').doc(oldTeacherId).update({ status: 'inativo' });
        console.log("Deactivated Lucivania in Firestore users collection.");
    }

    // Update exams
    const examsSnapshot = await db.collection('exams').get();
    let updatedExams = 0;
    
    for (const doc of examsSnapshot.docs) {
        const exam = doc.data();
        let changed = false;
        
        if (exam.collaborators) {
            for (let i = 0; i < exam.collaborators.length; i++) {
                if (exam.collaborators[i].userId === oldTeacherId) {
                    exam.collaborators[i].userId = newId;
                    exam.collaborators[i].name = newName;
                    changed = true;
                }
            }
        }
        
        if (exam.collaboratorIds) {
            const index = exam.collaboratorIds.indexOf(oldTeacherId);
            if (index !== -1) {
                exam.collaboratorIds[index] = newId;
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
    
    console.log(`Updated ${updatedExams} exams replacing Lucivania with Weslanne.`);
    
    // Update populate_3rd_bimester_exams.js
    const fs = require('fs');
    const pathFile = './populate_3rd_bimester_exams.js';
    if (fs.existsSync(pathFile)) {
        let script = fs.readFileSync(pathFile, 'utf8');
        // lucivania: { userId: 'lpxciCLQVmeRfThmcQ77aUv7nsI2', name: 'LUCIVANIA CARVALHO BARCELO' }
        script = script.replace(/lucivania: \{ userId: 'lpxciCLQVmeRfThmcQ77aUv7nsI2', name: 'LUCIVANIA CARVALHO BARCELO' \}/g, 
            `lucivania: { userId: '${newId}', name: '${newName}' }`); 
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
