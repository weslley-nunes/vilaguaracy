import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral" } = await req.json();

        // Lendo diretamente das variáveis de ambiente (sem chaves no código para evitar alertas do Google)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Chave não configurada no servidor." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Estes são os modelos que realmente estão liberados na sua conta nova
        const modelsToTry = [
            "gemini-flash-latest",
            "gemini-pro-latest",
            "gemini-2.5-flash",
            "gemini-3.1-pro-preview"
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
                    Gere 3 questões estritamente OBJETIVAS (múltipla escolha).
                    CADA questão DEVE ter EXATAMENTE 4 alternativas (A, B, C, D).
                    Como especialista, identifique e insira o código da habilidade da BNCC correspondente para CADA questão.
                    
                    Responda APENAS com um JSON válido neste formato exato:
                    {
                        "questions": [
                            {
                                "text": "Enunciado da questão...",
                                "type": "multiple_choice",
                                "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
                                "correct": "A",
                                "habilidade": "EF06HI02"
                            }
                        ]
                    }`;

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
