import { NextResponse } from "next/server";
import { getDb } from "@/services/firebase-admin";

export const maxDuration = 60; // Allow more time for batch processing

export async function POST(req) {
    try {
        const { pdfData, teacherId } = await req.json();

        if (!pdfData) {
            return NextResponse.json({ error: "Missing PDF data" }, { status: 400 });
        }

        const db = getDb();
        const apiKey = process.env.GEMINI_API_KEY;
        
        let mimeType = "application/pdf";
        let base64Data = pdfData;
        
        if (pdfData.includes(",")) {
            const matches = pdfData.match(/^data:(.+);base64,(.*)$/);
            if (matches) {
                mimeType = matches[1];
                base64Data = matches[2];
            } else {
                base64Data = pdfData.split(",")[1];
            }
        }

        const prompt = `
            Você é um corretor de provas em lote avançado.
            Vou enviar um arquivo PDF (ou imagem) contendo MÚLTIPLAS provas (uma ou mais páginas por aluno).
            Para CADA PROVA encontrada no arquivo, faça o seguinte:
            1. Encontre a caixa preta escrita "CÓDIGO: " e extraia apenas o código de 6 letras/números. (ex: "ABCDEF")
            2. Encontre o nome do aluno logo abaixo do código.
            3. Leia a folha de respostas oficial e identifique quais alternativas (A, B, C, D, E) o aluno preencheu para cada questão de múltipla escolha.
            
            Retorne APENAS um JSON estrito contendo um array 'exams' com o resultado de todas as provas encontradas.
            O formato EXATO esperado é:
            {
              "exams": [
                {
                  "examId": "ABCDEF",
                  "studentName": "Nome do Aluno",
                  "answers": [{"q": 1, "r": "A"}, {"q": 2, "r": "C"}]
                },
                ...
              ]
            }
            Não inclua markdown, crases ou qualquer texto adicional fora do JSON.
        `;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ]
                }]
            })
        });

        const geminiData = await geminiRes.json();
        
        if (geminiData.error) {
            throw new Error(geminiData.error.message);
        }

        const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{"exams":[]}';
        let parsedData = null;
        try {
            parsedData = JSON.parse(aiText.replace(/```json|```/g, "").trim());
        } catch (e) {
            throw new Error("A IA retornou um formato inválido de dados.");
        }

        const examsList = parsedData.exams || [];
        
        if (examsList.length === 0) {
            throw new Error("Nenhuma prova foi identificada no arquivo.");
        }

        const finalResults = [];

        // Process each identified exam
        for (const item of examsList) {
            const { examId, studentName, answers } = item;
            
            if (!examId || !answers) {
                finalResults.push({ studentName, examId, success: false, error: "Dados incompletos lidos pela IA" });
                continue;
            }

            try {
                // Find the exam in DB by shortId
                const snapshot = await db.collection("exams")
                    .where("shortId", "==", examId.toUpperCase())
                    .limit(1)
                    .get();
                
                if (snapshot.empty) {
                    finalResults.push({ studentName, examId, success: false, error: "Código da prova não encontrado" });
                    continue;
                }

                const docData = snapshot.docs[0].data();
                const realExamId = snapshot.docs[0].id;
                const questionsKey = docData.questions || [];

                let correctCount = 0;
                const detailedResults = [];
                const skillsStats = {};
                const subjectQuestions = {};
                const subjectCorrect = {};

                // Inicializa os contadores por componente curricular da prova oficial
                questionsKey.forEach(q => {
                    const sub = q.subject || "Geral";
                    if (!subjectQuestions[sub]) {
                        subjectQuestions[sub] = 0;
                        subjectCorrect[sub] = 0;
                    }
                    subjectQuestions[sub]++;
                });

                 answers.forEach((ans) => {
                    const questionKey = questionsKey.find(q => q.id === (ans.q).toString()) || questionsKey[ans.q - 1];
                    if (questionKey) {
                        const baseCorrect = questionKey.correct;
                        const correctStr = String(baseCorrect || "").trim();
                        const cleanCorrect = correctStr.length === 1 
                            ? correctStr.toUpperCase() 
                            : correctStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "").toUpperCase();
                        
                        const studentAns = String(ans.r || "").trim().toUpperCase();
                        const isCorrect = studentAns === cleanCorrect || studentAns === correctStr.toUpperCase();

                        if (isCorrect) {
                            correctCount++;
                            const sub = questionKey.subject || "Geral";
                            subjectCorrect[sub]++;
                        }

                        const skill = questionKey.bncc || "Geral";
                        if (!skillsStats[skill]) skillsStats[skill] = { correct: 0, total: 0 };
                        skillsStats[skill].total++;
                        if (isCorrect) skillsStats[skill].correct++;

                        detailedResults.push({
                            q: ans.q,
                            marked: studentAns || null,
                            correct: cleanCorrect || correctStr,
                            isCorrect,
                            skill,
                            subject: questionKey.subject || "Geral"
                        });
                    }
                });

                // Calcula as notas de 0 a 2 para cada disciplina
                const scoresBySubject = {};
                let totalCalculatedScore = 0;
                Object.keys(subjectQuestions).forEach(sub => {
                    const totalQ = subjectQuestions[sub];
                    const correctQ = subjectCorrect[sub];
                    const subjectScore = totalQ > 0 ? (correctQ / totalQ) * 2.0 : 0;
                    scoresBySubject[sub] = parseFloat(subjectScore.toFixed(2));
                    totalCalculatedScore += subjectScore;
                });
                totalCalculatedScore = parseFloat(totalCalculatedScore.toFixed(2));

                // Save to Database
                const correctionData = {
                    examId: realExamId,
                    studentName: studentName || "Anônimo",
                    classId: "Lote PDF",
                    score: totalCalculatedScore,
                    correctCount,
                    totalCount: questionsKey.length,
                    details: detailedResults,
                    skills: skillsStats,
                    scoresBySubject,
                    teacherId: teacherId || null,
                    correctedAt: new Date(),
                    createdAt: new Date(),
                };

                await db.collection("corrections").add(correctionData);

                finalResults.push({ 
                    studentName, 
                    examId, 
                    success: true, 
                    score: totalCalculatedScore 
                });

            } catch (err) {
                finalResults.push({ studentName, examId, success: false, error: "Erro ao calcular ou salvar" });
            }
        }

        return NextResponse.json({ success: true, results: finalResults });

    } catch (error) {
        console.error("Batch processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
