import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral", count = 3 } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return NextResponse.json({ error: "Chave não encontrada." }, { status: 500 });

        // A chave já está funcionando, então vamos direto ao modelo estável
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const prompt = `Você é um professor especialista. Gere ${count} questões de múltipla escolha sobre "${topic}" para ${level} (${year}), com dificuldade ${difficulty}.
        
        IMPORTANTE: Responda APENAS um objeto JSON puro, sem markdown, seguindo exatamente este formato:
        {
          "questions": [
            {
              "text": "Enunciado",
              "options": ["A", "B", "C", "D", "E"],
              "correct": "A",
              "habilidade": "BNCC code"
            }
          ]
        }`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Erro na geração");

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("A IA retornou uma resposta vazia.");

        // Limpeza de Markdown
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsedData = JSON.parse(text);
            
            // Garantir que questions seja um array
            const questions = Array.isArray(parsedData.questions) ? parsedData.questions : 
                              (Array.isArray(parsedData) ? parsedData : []);

            if (questions.length === 0) throw new Error("Formato de questões inválido.");

            const finalizedQuestions = questions.map((q, i) => ({
                id: Date.now() + i,
                text: q.text || q.enunciado || "Questão sem texto",
                options: Array.isArray(q.options) ? q.options : (q.alternativas || []),
                correct: q.correct || q.resposta || "A",
                habilidade: q.habilidade || "Geral"
            }));

            return NextResponse.json({ questions: finalizedQuestions });
        } catch (e) {
            console.error("Parse Error:", text);
            throw new Error("Falha ao processar o formato da IA.");
        }

    } catch (error) {
        console.error("Route Error:", error);
        return NextResponse.json({ error: `[IA ATIVA] ${error.message}` }, { status: 500 });
    }
}
