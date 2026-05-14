import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { examId, image } = await req.json();

        if (!examId || !image) {
            return NextResponse.json({ error: "Missing examId or image" }, { status: 400 });
        }

        // Call Gemini for OMR
        const apiKey = process.env.GEMINI_API_KEY;
        const model = "gemini-2.0-flash";
        
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
            throw new Error(geminiData.error.message);
        }

        const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        let aiResults = null;
        try {
            aiResults = JSON.parse(aiText.replace(/```json|```/g, "").trim());
        } catch (e) {
            throw new Error("Invalid JSON format from AI");
        }

        if (!aiResults || !aiResults.answers) {
            throw new Error("Formato de resposta da IA inválido.");
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
