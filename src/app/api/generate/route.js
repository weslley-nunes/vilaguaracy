import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral" } = await req.json();

        // Tentamos a variável de ambiente primeiro, com fallback garantido para a nova chave do AI Studio
        const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCQbxNfwSpv-tuQlKi5wKGzxGi6aOHf3tY";

        const genAI = new GoogleGenerativeAI(apiKey);

        // Modelos na ordem do 'Corrige pra mim'
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-2.0-flash-lite-001",
            "gemini-1.5-flash"
        ];

        let lastError = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `
                    Você é um professor especialista criando uma prova.
                    Tópico: ${topic}
                    Nível de Ensino: ${level}
                    Ano Escolar/Série: ${year}
                    Dificuldade: ${difficulty}
                    Gere 3 questões de múltipla escolha com a habilidade da BNCC.
                    Responda APENAS JSON: {"questions": [{"text": "...", "options": ["A","B","C","D","E"], "correct": "A", "habilidade": "..."}]}`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                
                const data = JSON.parse(text);
                data.questions = data.questions.map((q, i) => ({ ...q, id: Date.now() + i }));
                
                return NextResponse.json(data);
            } catch (e) {
                lastError = `Erro no modelo ${modelName}: ${e.message}`;
                continue;
            }
        }

        throw new Error(lastError || "Nenhum modelo funcionou.");

    } catch (error) {
        return NextResponse.json({ error: `[ERRO CRÍTICO 2.0] ${error.message}` }, { status: 500 });
    }
}
