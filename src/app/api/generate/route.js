import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        let { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral" } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return NextResponse.json({ error: "Chave não encontrada no servidor." }, { status: 500 });

        // Lista exaustiva de modelos para força bruta
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.0-pro",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro-001"
        ];

        const prompt = `Você é um professor especialista. Gere 3 questões de múltipla escolha sobre "${topic}" para ${level} (${year}), com dificuldade ${difficulty}.
        Responda APENAS um objeto JSON puro: {"questions": [{"text": "...", "options": ["A","B","C","D","E"], "correct": "A", "habilidade": "..."}]}`;

        let lastError = "";

        for (const model of modelsToTry) {
            try {
                // Tenta tanto v1 quanto v1beta para cada modelo
                for (const version of ["v1beta", "v1"]) {
                    const apiUrl = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`;
                    
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
                            const questions = Array.isArray(parsedData.questions) ? parsedData.questions : (Array.isArray(parsedData) ? parsedData : []);
                            
                            if (questions.length > 0) {
                                return NextResponse.json({ 
                                    questions: questions.slice(0, 3).map((q, i) => ({
                                        ...q,
                                        id: Date.now() + i,
                                        text: q.text || q.enunciado || "Questão sem texto",
                                        options: q.options || q.alternativas || [],
                                        correct: q.correct || q.resposta || "A",
                                        habilidade: q.habilidade || "Geral"
                                    }))
                                });
                            }
                        }
                    } else {
                        const err = await response.json();
                        lastError = err.error?.message || response.statusText;
                    }
                }
            } catch (e) {
                lastError = e.message;
            }
        }

        throw new Error(`O Google recusou todos os modelos. Último erro: ${lastError}`);

    } catch (error) {
        return NextResponse.json({ error: `[FORÇA BRUTA] ${error.message}` }, { status: 500 });
    }
}
