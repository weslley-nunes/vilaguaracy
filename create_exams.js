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

async function createEvaluations() {
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
    const adminUid = "f01buqnyVmNjNQR0CTEmlTL4NP22"; // Weslley (Coordenador)

    const teachers = {
        "Noemi": { uid: "QuWkbMK3JjMYBsfK234KfqpIXhY2", name: "NOEMI RAFAEL RODRIGUES DE SOUSA" },
        "Romário": { uid: "hJ0y2Lih2geS3kVzte6LLxwi7nt2", name: "ROMÁRIO COSME DA SILVA" },
        "Lucivânia": { uid: "lpxciCLQVmeRfThmcQ77aUv7nsI2", name: "LUCIVANIA CARVALHO BARCELO" },
        "Waldiclei": { uid: "XuzwmWUPvaaVsw8ILwl8KKL0CSu1", name: "WALDICLEY DA COSTA SILVA" },
        "Francisco": { uid: "NSrurLZkH4fVUejkr9m5H7YdJ8q1", name: "FRANCISCO WELLINGTON DE SOUSA COSTA" },
        "Pedro": { uid: "XGAPGkKMsHgDhllbA9YPWhoixT83", name: "PEDRO LUCAS FERREIRA DE CARVALHO" },
        "Weslley": { uid: "f01buqnyVmNjNQR0CTEmlTL4NP22", name: "WESLLEY NUNES DA SILVA" },
        "Alexandre": { uid: "jbUndrepCmMf3il6gNiBlthDxMA2", name: "ALEXANDRE SILVA SANTOS" },
        "Paulo": { uid: "Q2azsUelIzacOChMnMkwDXG4EGZ2", name: "PAULO HENRIQUE LINO DE ARAUJO" },
        "Matheus": { uid: "JyAljDrnFCgDWlqg39GYAwZjP4r2", name: "MATHEUS TREPTOW DE AMORIM" },
        "Bárbara": { uid: "W5MjhYd0daeDjZVOQkjVYnYOr8d2", name: "BARBARA PEREIRA DE SOUSA" },
        "Ana Cristina": { uid: "zX3LfW3q1rUglo4C4vhRUWSOTL83", name: "ANA CRISTINA DE MENEZES" }
    };

    const classes = [
        { id: "Br55W3eeZesVtsXkULWG", name: "82.01", group: "8/9" },
        { id: "UdcvQ1uGSvluB4gbVoNO", name: "82.02", group: "8/9" },
        { id: "tPFNLgKOyi1IdREGjrZF", name: "92.01", group: "8/9" },
        { id: "V4cbQVNZR0buDoZsDxhg", name: "92.02", group: "8/9" },
        { id: "SxSzOLNGdFgauctGDAMr", name: "62.01", group: "6/7" },
        { id: "3wAaC6ofUw0FolJDEm4M", name: "62.02", group: "6/7" },
        { id: "J6ScJ8KBszuNgZsp7Zcb", name: "72.01", group: "6/7" },
        { id: "1uiIUU3vX2Kuwpg3n9Di", name: "72.02", group: "6/7" }
    ];

    for (const cls of classes) {
        console.log(`Creating exams for class ${cls.name}...`);

        // Resolve teachers for this class
        let port, arte, ing, ef, hist, geo, mat, cie;

        if (cls.name === "82.01" || cls.name === "82.02") {
            port = teachers.Noemi; arte = teachers.Romário; ing = teachers.Lucivânia; ef = teachers.Waldiclei;
            hist = teachers.Francisco; geo = teachers.Pedro; mat = teachers.Weslley; cie = teachers.Alexandre;
        } else if (cls.name === "92.01" || cls.name === "92.02") {
            port = teachers.Noemi; arte = teachers.Romário; ing = teachers.Lucivânia; ef = teachers.Waldiclei;
            hist = teachers.Francisco; geo = teachers.Matheus; mat = teachers.Paulo; cie = teachers["Ana Cristina"];
        } else if (cls.name === "62.01" || cls.name === "62.02") {
            port = teachers.Noemi; arte = teachers.Romário; ing = teachers.Lucivânia; ef = teachers.Waldiclei;
            hist = teachers.Francisco; geo = teachers.Matheus; mat = teachers.Paulo; cie = teachers["Ana Cristina"];
        } else if (cls.name === "72.01" || cls.name === "72.02") {
            port = teachers.Bárbara; arte = teachers.Romário; ing = teachers.Lucivânia; ef = teachers.Waldiclei;
            hist = teachers.Francisco; geo = teachers.Pedro; mat = teachers.Paulo; cie = teachers["Ana Cristina"];
        }

        const templates = [
            {
                type: "Linguagens",
                title: `${cls.name} - 1º Bimestre - Avaliação de Linguagens`,
                collaborators: [
                    { userId: port.uid, name: port.name, subject: "Língua Portuguesa", quota: 5 },
                    { userId: arte.uid, name: arte.name, subject: "Arte", quota: 5 },
                    { userId: ing.uid, name: ing.name, subject: "Língua Inglesa", quota: 5 },
                    { userId: ef.uid, name: ef.name, subject: "Educação Física", quota: 5 }
                ]
            },
            {
                type: "Humanas",
                title: `${cls.name} - 1º Bimestre - Avaliação de Humanas`,
                collaborators: [
                    { userId: hist.uid, name: hist.name, subject: "História", quota: 10 },
                    { userId: geo.uid, name: geo.name, subject: "Geografia", quota: 10 }
                ]
            },
            {
                type: "Ciências",
                title: `${cls.name} - 1º Bimestre - Avaliação de Ciências`,
                collaborators: [
                    { userId: mat.uid, name: mat.name, subject: "Matemática", quota: 10 },
                    { userId: cie.uid, name: cie.name, subject: "Ciências", quota: 10 }
                ]
            }
        ];

        for (const template of templates) {
            await db.collection("exams").add({
                title: template.title,
                teacherId: adminUid,
                teacherName: "Weslley Nunes (Coordenação)",
                classId: cls.id,
                className: cls.name,
                bimester: "1º Bimestre",
                templateType: template.type,
                scoringMode: "auto",
                totalScore: 3,
                collaborators: template.collaborators,
                collaboratorIds: template.collaborators.map(c => c.userId),
                questions: [], // Waiting for professors
                status: "pendente",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`  Created: ${template.title}`);
        }
    }
    console.log("All evaluations created successfully!");
}

createEvaluations();
