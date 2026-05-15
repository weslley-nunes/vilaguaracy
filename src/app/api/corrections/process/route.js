import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { examId, image } = await req.json();

        if (!examId || !image) {
            return NextResponse.json({ error: "Missing examId or image" }, { status: 400 });
        }

        // Call Gemini for OMR with Fallback
        const apiKey = process.env.GEMINI_API_KEY;
        const models = [
            "gemini-3.1-flash-lite", // 500 RPD limit, excellent for fast OMR
            "gemini-1.5-flash", 
            "gemini-1.5-flash-8b", 
            "gemini-3-flash"
        ];
        
        const prompt = `
            Você é um corretor de provas automático altamente avançado. 
            Analise a imagem fornecida, que corresponde a uma prova ou cartão resposta de um aluno.
            O objetivo principal é extrair QUAIS alternativas (A, B, C, D, E) o aluno assinalou para cada questão.
            Retorne APENAS um JSON no formato EXATO: {"answers": [{"q": 1, "r": "A"}, {"q": 2, "r": "C"}], "s": "Nome do Aluno", "ac": "codigo_acesso"}.
            Não adicione blocos de markdown e nenhum outro texto além do JSON.
        `;

        let mimeType = "image/jpeg";
        let base64Data = image;
        if (image.includes(",")) {
            const matches = image.match(/^data:(.+);base64,(.*)$/);
            if (matches) {
                mimeType = matches[1];
                base64Data = matches[2];
            } else {
                base64Data = image.split(",")[1];
            }
        }

        let aiResults = null;
        let lastError = "Nenhum modelo respondeu corretamente.";

        for (const model of models) {
            try {
                const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
                    console.warn(`[GEMINI] Model ${model} failed: ${geminiData.error.message}`);
                    lastError = geminiData.error.message;
                    continue; // Tenta o próximo modelo
                }

                const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                
                try {
                    aiResults = JSON.parse(aiText.replace(/```json|```/g, "").trim());
                } catch (e) {
                    console.warn(`[GEMINI] Model ${model} returned invalid JSON: ${aiText}`);
                    lastError = "Formato de JSON inválido retornado pela IA.";
                    continue; // Tenta o próximo modelo
                }

                if (!aiResults || !aiResults.answers) {
                    lastError = "Formato de resposta da IA inválido (sem answers).";
                    continue; // Tenta o próximo modelo
                }
                
                // Se chegou aqui, deu tudo certo!
                console.log(`[GEMINI] Success with model: ${model}`);
                break;

            } catch (err) {
                console.warn(`[GEMINI] Model ${model} crashed: ${err.message}`);
                lastError = err.message;
            }
        }

        if (!aiResults || !aiResults.answers) {
            throw new Error(`Falha em todos os modelos de IA. Último erro: ${lastError}`);
        }

        return NextResponse.json({
            success: true,
            aiResults: aiResults
        });

    } catch (error) {
        console.error("Correction processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
