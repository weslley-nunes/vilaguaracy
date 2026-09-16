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
    const newName = "DANILO COSTA DA SILVEIRA";
    const newCpf = "348.642.530-72";
    const newCleanCpf = "34864253072";
    const newEmail = `${newCleanCpf}@vilaguaracy.com.br`;
    const newPassword = "Vila@123";

    // 1. Get 8th and 9th grade classes
    const classesSnapshot = await db.collection('classes').get();
    const targetClassIds = [];
    
    classesSnapshot.docs.forEach(doc => {
        const c = doc.data();
        if (c.name.includes("82.") || c.name.includes("92.")) {
            targetClassIds.push(doc.id);
        }
    });
    
    console.log(`Found ${targetClassIds.length} target classes for 8th and 9th grades.`);

    // 2. Create User in Auth
    let newId;
    try {
        const userRecord = await auth.getUserByEmail(newEmail);
        newId = userRecord.uid;
        console.log("User Danilo already exists in Auth: ", newId);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            console.log("Creating user Danilo in Auth...");
            const userRecord = await auth.createUser({
                email: newEmail,
                password: newPassword,
                displayName: newName
            });
            newId = userRecord.uid;
            console.log("Created Danilo Auth: ", newId);
        } else {
            throw e;
        }
    }
    
    // 3. Create Firestore User
    await db.collection('users').doc(newId).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: 'professor',
        cpf: newCleanCpf,
        name: newName,
        email: newEmail,
        status: 'ativo',
        subject: 'Educação Física',
        subjects: ['Educação Física'],
        classes: targetClassIds
    });
    console.log("Created/Updated Danilo in Firestore users collection.");

    // 4. Update Old Teacher (Waldicley)
    const oldTeacherId = 'XuzwmWUPvaaVsw8ILwl8KKL0CSu1';
    const oldTeacherDoc = await db.collection('users').doc(oldTeacherId).get();
    if (oldTeacherDoc.exists) {
        let oldClasses = oldTeacherDoc.data().classes || [];
        oldClasses = oldClasses.filter(cId => !targetClassIds.includes(cId));
        await db.collection('users').doc(oldTeacherId).update({ classes: oldClasses });
        console.log("Removed 8th/9th grade classes from Waldicley.");
    }

    // 5. Update Exams in DB
    const examsSnapshot = await db.collection('exams').get();
    let updatedExams = 0;
    
    for (const doc of examsSnapshot.docs) {
        const exam = doc.data();
        const className = exam.className || "";
        
        // Only target 8th and 9th grade exams
        if (className.includes("82.") || className.includes("92.")) {
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
    }
    
    console.log(`Updated ${updatedExams} exams replacing Waldicley with Danilo in 8th and 9th grades.`);
    
    // 6. Update script populate_3rd_bimester_exams.js
    const fs = require('fs');
    const pathFile = './populate_3rd_bimester_exams.js';
    if (fs.existsSync(pathFile)) {
        let script = fs.readFileSync(pathFile, 'utf8');
        
        // Ensure Danilo is in TEACHERS map
        if (!script.includes("DANILO COSTA DA SILVEIRA")) {
            script = script.replace(
                "const TEACHERS = {",
                `const TEACHERS = {\n    danilo: { userId: '${newId}', name: '${newName}' },`
            );
            
            // Replace Waldicley's logic in getCollaborators
            const searchStr = `list.push({ ...TEACHERS.waldicley, subject: 'Educação Física', quota: 5, current: 0 });`;
            const replacement = `if (classNum.startsWith('82') || classNum.startsWith('92')) {
            list.push({ ...TEACHERS.danilo, subject: 'Educação Física', quota: 5, current: 0 });
        } else {
            list.push({ ...TEACHERS.waldicley, subject: 'Educação Física', quota: 5, current: 0 });
        }`;
            
            script = script.replace(searchStr, replacement);
            fs.writeFileSync(pathFile, script, 'utf8');
            console.log("Updated populate script for Danilo.");
        }
    }
}

main().then(() => {
    console.log("Done.");
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
