import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral", count = 3 } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return NextResponse.json({ error: "Configuração incompleta: GEMINI_API_KEY não encontrada." }, { status: 500 });

        // Try both v1 and v1beta as some keys only work in one of them
        const apiVersions = ["v1", "v1beta"];
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        
        let lastError = null;

        const prompt = `Gere ${count} questões de múltipla escolha sobre ${topic} para ${level} (${year}), dificuldade ${difficulty}. 
        Responda APENAS um JSON: {"questions": [{"text": "...", "options": ["A","B","C","D","E"], "correct": "A", "habilidade": "..."}]}`;

        for (const version of apiVersions) {
            for (const modelName of models) {
                try {
                    const apiUrl = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                            const parsedData = JSON.parse(text);
                            parsedData.questions = parsedData.questions.map((q, i) => ({ ...q, id: Date.now() + i }));
                            return NextResponse.json(parsedData);
                        }
                    } else {
                        const err = await response.json();
                        lastError = `[${version}/${modelName}] ${err.error?.message}`;
                    }
                } catch (e) {
                    lastError = e.message;
                }
            }
        }

        throw new Error(lastError || "Nenhum modelo ou versão de API respondeu para esta chave.");

    } catch (error) {
        return NextResponse.json({ error: `[FALHA TOTAL] ${error.message}` }, { status: 500 });
    }
}
