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

                let score = 0;
                let correctCount = 0;
                const detailedResults = [];
                const skillsStats = {};

                answers.forEach((ans) => {
                    const questionKey = questionsKey.find(q => q.id === (ans.q).toString()) || questionsKey[ans.q - 1];
                    if (questionKey) {
                        const isCorrect = ans.r === questionKey.correct;
                        if (isCorrect) {
                            score += parseFloat(questionKey.points || 1);
                            correctCount++;
                        }

                        const skill = questionKey.bncc || "Geral";
                        if (!skillsStats[skill]) skillsStats[skill] = { correct: 0, total: 0 };
                        skillsStats[skill].total++;
                        if (isCorrect) skillsStats[skill].correct++;

                        detailedResults.push({
                            q: ans.q,
                            marked: ans.r,
                            correct: questionKey.correct,
                            isCorrect,
                            skill
                        });
                    }
                });

                // Calculate final percentage score (0-10) based on points
                const totalPoints = questionsKey.reduce((sum, q) => sum + parseFloat(q.points || 1), 0);
                const finalScore = totalPoints > 0 ? ((score / totalPoints) * 10).toFixed(1) : "0.0";

                // Save to Database
                const correctionData = {
                    examId: realExamId,
                    studentName: studentName || "Anônimo",
                    classId: "Lote PDF",
                    score: finalScore,
                    correctCount,
                    totalCount: questionsKey.length,
                    details: detailedResults,
                    skills: skillsStats,
                    teacherId: teacherId || null,
                    correctedAt: new Date(),
                    createdAt: new Date(),
                };

                await db.collection("corrections").add(correctionData);

                finalResults.push({ 
                    studentName, 
                    examId, 
                    success: true, 
                    score: finalScore 
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
