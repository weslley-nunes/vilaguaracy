const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
if (!admin.apps.length) {
    admin.initializeApp({ 
        credential: admin.credential.cert({ 
            projectId: 'vila-guaracy', 
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL, 
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        }) 
    });
}
const db = admin.firestore();

const subjectOrder = [
    "Arte", "Educação Física", "Língua Inglesa", "Inglês",
    "Língua Portuguesa", "História", "Geografia", "Ciências", "Matemática"
];

const getSubjectIndex = (subjectName) => {
    if (!subjectName) return 999;
    const lowerName = subjectName.toLowerCase().trim();
    for (let i = 0; i < subjectOrder.length; i++) {
        const ord = subjectOrder[i].toLowerCase();
        if (lowerName === ord || lowerName.includes(ord) || ord.includes(lowerName)) {
            return i;
        }
    }
    return 999;
};

async function fixExams() {
    console.log('Fetching all exams...');
    const examsSnapshot = await db.collection('exams').get();
    const exams = examsSnapshot.docs.map(d => ({id: d.id, ...d.data()}));
    
    for (const exam of exams) {
        if (!exam.questions || exam.questions.length === 0) continue;
        
        let questions = [...exam.questions];
        
        // --- MANUAL REVERT FOR SPECIFIC ERROR IN PREVIOUS FIX ---
        if (exam.id === 'FhggqMNTqIJ3Boyr6z3L') {
            questions = questions.map(q => {
                if (q.text && q.text.includes('o principal agente natural responsável')) {
                    q.correct = 'C';
                }
                return q;
            });
        }
        
        // Sort questions
        questions.sort((a, b) => getSubjectIndex(a.subject) - getSubjectIndex(b.subject));
        
        // Regenerate Answer Key
        const answerKey = {};
        questions.forEach((q, idx) => {
            if (q.correct) answerKey[idx] = q.correct;
        });
        
        console.log(`Updating Exam ${exam.id} (${exam.title})...`);
        await db.collection('exams').doc(exam.id).update({
            questions,
            answerKey
        });
        
        // Fetch and fix all corrections for this exam
        const correctionsSnap = await db.collection('corrections').where('examId', '==', exam.id).get();
        if (correctionsSnap.empty) continue;
        
        console.log(`   Found ${correctionsSnap.size} corrections. Recalculating...`);
        for (const corrDoc of correctionsSnap.docs) {
            const corr = corrDoc.data();
            const studentAnswers = corr.studentAnswers || {};
            
            let correctCount = 0;
            const details = [];
            const subjectQuestions = {};
            const subjectCorrect = {};
            
            questions.forEach((q, idx) => {
                const studentAns = studentAnswers[idx];
                const baseCorrect = q.correct || (answerKey && answerKey[idx]);
                const correctStr = String(baseCorrect || "").trim();
                
                const cleanCorrect = correctStr.length === 1 
                    ? correctStr.toUpperCase() 
                    : correctStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "").toUpperCase();
                
                const isCorrect = studentAns === cleanCorrect || studentAns === correctStr.toUpperCase();
                
                if (isCorrect) correctCount++;
                
                const subject = q.subject || "Geral";
                if (!subjectQuestions[subject]) {
                    subjectQuestions[subject] = 0;
                    subjectCorrect[subject] = 0;
                }
                subjectQuestions[subject]++;
                if (isCorrect) {
                    subjectCorrect[subject]++;
                }
                
                details.push({
                    questionIndex: idx,
                    habilidade: q.habilidade || "N/A",
                    subject,
                    isCorrect,
                    studentAnswer: studentAns || null,
                    correctAnswer: cleanCorrect || correctStr
                });
            });
            
            const totalCount = questions.length;
            const scoresBySubject = {};
            
            if (exam.scoringMode === 'manual') {
                Object.keys(subjectQuestions).forEach(subj => {
                    const subjScore = details.reduce((acc, d) => {
                        if (d.subject === subj && d.isCorrect) {
                            return acc + (Number(questions[d.questionIndex].points) || 1);
                        }
                        return acc;
                    }, 0);
                    scoresBySubject[subj] = { score: subjScore, correctCount: subjectCorrect[subj], totalQuestions: subjectQuestions[subj] };
                });
                
                const finalScore = details.reduce((acc, d) => {
                    if (d.isCorrect) return acc + (Number(questions[d.questionIndex].points) || 1);
                    return acc;
                }, 0);
                
                await db.collection('corrections').doc(corrDoc.id).update({
                    correctCount,
                    score: finalScore,
                    scoresBySubject,
                    details
                });
                
            } else {
                // Auto scoring
                const totalScore = Number(exam.totalScore) || 10;
                const pointsPerQuestion = totalScore / totalCount;
                
                Object.keys(subjectQuestions).forEach(subj => {
                    const count = subjectCorrect[subj];
                    scoresBySubject[subj] = { 
                        score: count * pointsPerQuestion, 
                        correctCount: count, 
                        totalQuestions: subjectQuestions[subj] 
                    };
                });
                
                const finalScore = correctCount * pointsPerQuestion;
                
                await db.collection('corrections').doc(corrDoc.id).update({
                    correctCount,
                    score: finalScore,
                    scoresBySubject,
                    details
                });
            }
        }
    }
    console.log('All done!');
}

fixExams().catch(console.error);
