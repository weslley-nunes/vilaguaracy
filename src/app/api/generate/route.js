import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral", count = 3 } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return NextResponse.json({ error: "Chave não encontrada." }, { status: 500 });

        // DIAGNÓSTICO: Tentar listar modelos primeiro para ver o que a chave enxerga
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        if (!listRes.ok) {
            throw new Error(`[ERRO DE LISTAGEM] O Google retornou: ${JSON.stringify(listData)}`);
        }

        const models = listData.models || [];
        if (models.length === 0) {
            throw new Error("Sua chave não tem nenhum modelo disponível. Verifique se a 'Generative Language API' está realmente ativa no Console do Google Cloud.");
        }

        // Tentar o primeiro modelo da lista que o Google nos deu
        const firstModel = models.find(m => m.name.includes("flash")) || models[0];
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${firstModel.name}:generateContent?key=${apiKey}`;

        const prompt = `Gere ${count} questões de múltipla escolha sobre ${topic} para ${level} (${year}), dificuldade ${difficulty}. Responda apenas JSON.`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`[ERRO DE GERAÇÃO] ${JSON.stringify(data)}`);

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(text);
        parsedData.questions = parsedData.questions.map((q, i) => ({ ...q, id: Date.now() + i }));
        
        return NextResponse.json(parsedData);

    } catch (error) {
        return NextResponse.json({ error: `[DIAGNÓSTICO] ${error.message}` }, { status: 500 });
    }
}
// Build Trigger: Confirmed Project Key
