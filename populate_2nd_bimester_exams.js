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

// Teacher UIDs and Names mapping
const TEACHERS = {
    romario: { userId: 'hJ0y2Lih2geS3kVzte6LLxwi7nt2', name: 'ROMÁRIO COSME DA SILVA' },
    waldicley: { userId: 'XuzwmWUPvaaVsw8ILwl8KKL0CSu1', name: 'WALDICLEY DA COSTA SILVA' },
    lucivania: { userId: 'lpxciCLQVmeRfThmcQ77aUv7nsI2', name: 'LUCIVANIA CARVALHO BARCELO' },
    noemi: { userId: 'QuWkbMK3JjMYBsfK234KfqpIXhY2', name: 'NOEMI RAFAEL RODRIGUES DE SOUSA' },
    barbara: { userId: 'W5MjhYd0daeDjZVOQkjVYnYOr8d2', name: 'BARBARA PEREIRA DE SOUSA' },
    wellington: { userId: 'NSrurLZkH4fVUejkr9m5H7YdJ8q1', name: 'FRANCISCO WELLINGTON DE SOUSA COSTA' },
    matheus: { userId: 'JyAljDrnFCgDWlqg39GYAwZjP4r2', name: 'MATHEUS TREPTOW DE AMORIM' },
    pedro: { userId: 'XGAPGkKMsHgDhllbA9YPWhoixT83', name: 'PEDRO LUCAS FERREIRA DE CARVALHO' },
    paulo: { userId: 'Q2azsUelIzacOChMnMkwDXG4EGZ2', name: 'PAULO HENRIQUE LINO DE ARAUJO' },
    weslley: { userId: 'f01buqnyVmNjNQR0CTEmlTL4NP22', name: 'WESLLEY NUNES DA SILVA' },
    alexandre: { userId: 'jbUndrepCmMf3il6gNiBlthDxMA2', name: 'ALEXANDRE SILVA SANTOS' },
    ana_cristina: { userId: 'zX3LfW3q1rUglo4C4vhRUWSOTL83', name: 'ANA CRISTINA DE MENEZES' }
};

async function getCollaborators(classNum, examType) {
    const list = [];
    
    if (examType === 'Linguagens') {
        // Arte (5) - Romário
        list.push({ ...TEACHERS.romario, subject: 'Arte', quota: 5, current: 0 });
        // Educação Física (5) - Waldicley
        list.push({ ...TEACHERS.waldicley, subject: 'Educação Física', quota: 5, current: 0 });
        // Inglês (5) - Lucivania
        list.push({ ...TEACHERS.lucivania, subject: 'Língua Inglesa', quota: 5, current: 0 });
        // Língua Portuguesa (10) - Barbara for 72.01/72.02, Noemi for others
        if (classNum === '72.01' || classNum === '72.02') {
            list.push({ ...TEACHERS.barbara, subject: 'Língua Portuguesa', quota: 10, current: 0 });
        } else {
            list.push({ ...TEACHERS.noemi, subject: 'Língua Portuguesa', quota: 10, current: 0 });
        }
    } else if (examType === 'Humanas') {
        // História (10) - Wellington
        list.push({ ...TEACHERS.wellington, subject: 'História', quota: 10, current: 0 });
        // Geografia (10) - Pedro for 72.x and 82.x, Matheus for others
        if (classNum === '72.01' || classNum === '72.02' || classNum === '82.01' || classNum === '82.02') {
            list.push({ ...TEACHERS.pedro, subject: 'Geografia', quota: 10, current: 0 });
        } else {
            list.push({ ...TEACHERS.matheus, subject: 'Geografia', quota: 10, current: 0 });
        }
    } else if (examType === 'Natureza_Matematica') {
        // Matemática (10) - Weslley for 82.x, Paulo for others
        if (classNum === '82.01' || classNum === '82.02') {
            list.push({ ...TEACHERS.weslley, subject: 'Matemática', quota: 10, current: 0 });
        } else {
            list.push({ ...TEACHERS.paulo, subject: 'Matemática', quota: 10, current: 0 });
        }
        // Ciências (10) - Alexandre for 82.x and 92.02, Ana Cristina for others
        if (classNum === '82.01' || classNum === '82.02' || classNum === '92.02') {
            list.push({ ...TEACHERS.alexandre, subject: 'Ciências', quota: 10, current: 0 });
        } else {
            list.push({ ...TEACHERS.ana_cristina, subject: 'Ciências', quota: 10, current: 0 });
        }
    }

    return list;
}

async function main() {
    console.log("Starting 2nd Bimester Exams Population...");

    // 1. Fetch all classes
    const classesSnapshot = await db.collection('classes').get();
    console.log(`Found ${classesSnapshot.size} classes in database.`);

    const examTypes = [
        { key: 'Linguagens', name: 'Avaliação de Linguagens' },
        { key: 'Humanas', name: 'Avaliação de Ciências Humanas' },
        { key: 'Natureza_Matematica', name: 'Avaliação de Ciências da Natureza e Matemática' }
    ];

    let createdCount = 0;

    for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data();
        const classId = classDoc.id;
        const className = classData.name; // e.g. "Turma 62.01"
        const classNum = className.replace("Turma ", "").trim(); // "62.01"

        console.log(`\nProcessing ${className} (Num: ${classNum}, ID: ${classId})`);

        for (const type of examTypes) {
            const collaborators = await getCollaborators(classNum, type.key);
            const collaboratorIds = collaborators.map(c => c.userId);

            const examData = {
                title: `${className} - 2º Bimestre - ${type.name}`,
                bimester: "2º Bimestre",
                teacherId: "z6Ua8dAArHaP3dktlDJJiM3Amdd2", // Owned by Admin
                teacherName: "Coordenação",
                classId: classId,
                className: className,
                totalScore: 2.0,
                scoringMode: "auto",
                status: "published",
                questions: [],
                collaborators: collaborators,
                collaboratorIds: collaboratorIds,
                headerConfig: {
                    schoolName: "ESCOLA ESTADUAL VILA GUARACY",
                    bimester: "2º Bimestre",
                    className: className,
                    teacherName: "",
                    showDate: true,
                    logoUrl: "https://vilaguaracy.com.br/logo.png",
                    customHeaderImageUrl: "",
                    useCustomHeader: false,
                    subject: "Geral",
                    instructions: "Leia atentamente cada questão antes de responder.\nUtilize caneta esferográfica azul ou preta para preencher o gabarito."
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                studentCount: classData.students ? classData.students.length : 0
            };

            // Add to Firestore
            const docRef = await db.collection("exams").add(examData);
            
            // Update with ID and shortId
            await docRef.update({
                id: docRef.id,
                shortId: docRef.id.slice(-6).toUpperCase()
            });

            console.log(`  Created exam: "${examData.title}"`);
            console.log(`    Doc ID: ${docRef.id} | Short ID: ${docRef.id.slice(-6).toUpperCase()}`);
            console.log(`    Collaborators: ${collaborators.map(c => `${c.subject} (${c.name})`).join(', ')}`);
            createdCount++;
        }
    }

    console.log(`\nSuccess! Created ${createdCount} exams in total.`);
}

main().catch(err => {
    console.error("Error populating exams:", err);
    process.exit(1);
});
