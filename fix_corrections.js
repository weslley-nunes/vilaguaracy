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

async function fixExams() {
    console.log('Fetching all exams...');
    const examsSnapshot = await db.collection('exams').get();
    const exams = examsSnapshot.docs.map(d => ({id: d.id, ...d.data()}));
    
    for (const exam of exams) {
        if (!exam.questions || exam.questions.length === 0) continue;
        
        let questions = exam.questions; // the questions are ALREADY SORTED in the DB from our previous run
        
        // Regenerate Answer Key
        const answerKey = {};
        questions.forEach((q, idx) => {
            if (q.correct) answerKey[idx] = q.correct;
        });
        
        // Fetch and fix all corrections for this exam
        const correctionsSnap = await db.collection('corrections').where('examId', '==', exam.id).get();
        if (correctionsSnap.empty) continue;
        
        console.log(`Updating Exam ${exam.id} (${exam.title})... Found ${correctionsSnap.size} corrections. Recalculating...`);
        for (const corrDoc of correctionsSnap.docs) {
            const corr = corrDoc.data();
            const studentAnswers = corr.answers || {}; 
            
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
            let totalCalculatedScore = 0;
            Object.keys(subjectQuestions).forEach(subject => {
                const totalQ = subjectQuestions[subject];
                const correctQ = subjectCorrect[subject];
                
                let subjectScore = 0;
                if (exam.scoringMode === 'manual') {
                    subjectScore = details.reduce((acc, d) => {
                        if (d.subject === subject && d.isCorrect) {
                            return acc + (Number(questions[d.questionIndex].points) || 1);
                        }
                        return acc;
                    }, 0);
                } else {
                    subjectScore = totalQ > 0 ? (correctQ / totalQ) * 2.0 : 0;
                }
                
                scoresBySubject[subject] = parseFloat(subjectScore.toFixed(2));
                totalCalculatedScore += subjectScore;
            });
            totalCalculatedScore = parseFloat(totalCalculatedScore.toFixed(2));
            
            await db.collection('corrections').doc(corrDoc.id).update({
                correctCount,
                score: totalCalculatedScore,
                scoresBySubject,
                details
            });
        }
    }
    console.log('All done!');
}

fixExams().catch(console.error);
