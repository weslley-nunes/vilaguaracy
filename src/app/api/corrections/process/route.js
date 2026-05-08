import { NextResponse } from "next/server";
import { getDb } from "@/services/firebase-admin";

export async function POST(req) {
    try {
        const { examId, studentName, image } = await req.json();

        if (!examId || !image) {
            return NextResponse.json({ error: "Missing examId or image" }, { status: 400 });
        }

        const db = getDb();
        
        // 1. Fetch Exam Key
        const examDoc = await db.collection("exams").doc(examId).get();
        if (!examDoc.exists) {
            // Check if examId is actually a name/slug if it was from a collection.
            // But usually we search by ID first.
            const examsByCustomId = await db.collection("exams").where("id", "==", examId).limit(1).get();
            if (examsByCustomId.empty) {
                return NextResponse.json({ error: "Exam not found" }, { status: 404 });
            }
            var examData = examsByCustomId.docs[0].data();
        } else {
            var examData = examDoc.data();
        }

        const questionsKey = examData.questions || [];

        // 2. Call Gemini for OMR (with Fallback for Quota)
        const apiKey = process.env.GEMINI_API_KEY;
        const models = ["gemini-2.5-flash", "gemini-3-flash", "gemini-2-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
        let aiResults = null;
        let lastError = null;

        for (const model of models) {
            try {
                const prompt = `
                    Você é um corretor de provas automático. 
                    Analise esta imagem de um cartão resposta.
                    Existem marcadores pretos nos 4 cantos da área de interesse.
                    Identifique quais alternativas (A, B, C, D, E) foram preenchidas para cada questão.
                    Apenas considere as questões de múltipla escolha.
                    Retorne APENAS um JSON no formato: {"answers": [{"q": 1, "r": "A"}, {"q": 2, "r": "C"}, ...]}.
                `;

                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                { inline_data: { mime_type: "image/jpeg", data: image.split(",")[1] || image } }
                            ]
                        }]
                    })
                });

                if (geminiRes.status === 429 || geminiRes.status === 503) {
                    console.warn(`Model ${model} limited or busy. Trying next...`);
                    continue;
                }

                const geminiData = await geminiRes.json();
                if (geminiData.error) {
                    console.error(`Error with model ${model}:`, geminiData.error);
                    lastError = geminiData.error.message;
                    continue;
                }

                const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                aiResults = JSON.parse(aiText.replace(/```json|```/g, "").trim());
                
                if (aiResults && aiResults.answers) {
                    console.log(`Success using model: ${model}`);
                    break; // Success!
                }
            } catch (e) {
                console.error(`Failed with model ${model}:`, e);
                lastError = e.message;
            }
        }

        if (!aiResults) {
            throw new Error(`Todos os modelos de IA falharam ou atingiram a cota. Erro: ${lastError}`);
        }

        // 3. Calculate Score and Skills
        let score = 0;
        const detailedResults = [];
        const skillsStats = {};

        aiResults.answers.forEach((ans) => {
            const questionKey = questionsKey.find(q => q.id === (ans.q).toString()) || questionsKey[ans.q - 1];
            if (questionKey) {
                const isCorrect = ans.r === questionKey.correct;
                if (isCorrect) score++;

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

        const finalScore = (score / questionsKey.length) * 10;

        // 4. Save to Database
        const correctionData = {
            examId,
            studentName: studentName || aiResults.s || "Anônimo",
            accessCode: aiResults.ac || "", // Extract accessCode from QR data if present
            score: finalScore.toFixed(1),
            results: detailedResults,
            skills: skillsStats,
            correctedAt: new Date(),
        };

        await db.collection("corrections").add(correctionData);

        return NextResponse.json({
            success: true,
            score: finalScore.toFixed(1),
            results: detailedResults,
            skills: Object.entries(skillsStats).map(([label, stats]) => ({
                label,
                progress: stats.correct / stats.total,
                correct: stats.correct,
                total: stats.total
            }))
        });

    } catch (error) {
        console.error("Correction processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
