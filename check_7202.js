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

async function run() {
    const examId = 'FhggqMNTqIJ3Boyr6z3L';
    console.log(`Loading exam ${examId}...`);
    const examDoc = await db.collection('exams').doc(examId).get();
    
    if (!examDoc.exists) {
        console.log("Exam not found!");
        return;
    }

    const examData = examDoc.data();
    console.log(`Exam Title: ${examData.title}`);
    console.log(`Q20 (Index 19) Official Answer:`, examData.answerKey ? examData.answerKey['19'] : (examData.questions[19] ? examData.questions[19].correct : 'N/A'));

    console.log("\nLoading corrections...");
    const correctionsSnapshot = await db.collection('corrections').where('examId', '==', examId).get();
    console.log(`Found ${correctionsSnapshot.size} corrections.`);
    
    correctionsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`\nStudent: ${data.studentName}`);
        if(data.details && data.details.length > 19) {
            console.log(`  Current Q20 isCorrect: ${data.details[19].isCorrect} (Student marked: ${data.details[19].studentAnswer}, Detail says correct is: ${data.details[19].correctAnswer})`);
        }
        
        // Let's dry run the recalculation
        let newCorrectCount = 0;
        let subjectQuestions = {};
        let subjectCorrect = {};
        
        examData.questions.forEach((q, idx) => {
            const studentAns = data.answers ? data.answers[idx] : (data.details[idx] ? data.details[idx].studentAnswer : null);
            const baseCorrect = q.correct || (examData.answerKey && examData.answerKey[idx]);
            const correctStr = String(baseCorrect || "").trim();
            const cleanCorrect = correctStr.length === 1 ? correctStr.toUpperCase() : correctStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "").toUpperCase();
            
            const isCorrect = studentAns === cleanCorrect || studentAns === correctStr.toUpperCase();
            if (isCorrect) newCorrectCount++;
            
            const subject = q.subject || "Geral";
            if (!subjectQuestions[subject]) { subjectQuestions[subject] = 0; subjectCorrect[subject] = 0; }
            subjectQuestions[subject]++;
            if (isCorrect) subjectCorrect[subject]++;
            
            if (idx === 19) {
                console.log(`  DRY RUN Q20 -> BaseCorrect: ${baseCorrect}, CleanCorrect: ${cleanCorrect}, Student: ${studentAns}, isCorrect: ${isCorrect}`);
            }
        });
        
        let newTotalScore = 0;
        Object.keys(subjectQuestions).forEach(subject => {
            const totalQ = subjectQuestions[subject];
            const correctQ = subjectCorrect[subject];
            const subjectScore = totalQ > 0 ? (correctQ / totalQ) * 2.0 : 0;
            newTotalScore += subjectScore;
        });
        newTotalScore = parseFloat(newTotalScore.toFixed(2));
        
        console.log(`  Score: Old=${data.score} | New=${newTotalScore}`);
        console.log(`  CorrectCount: Old=${data.correctCount} | New=${newCorrectCount}`);
    });
}

run();
