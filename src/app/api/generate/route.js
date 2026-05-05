import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral" } = await req.json();

        // Use Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey.startsWith("your_")) {
            return NextResponse.json({ error: "Chave não configurada." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // List of models copied exactly from 'Corrige pra mim'
        const modelsToTry = [
            "gemini-2.0-flash",
            "gemini-2.0-flash-001",
            "gemini-2.0-flash-lite-001",
            "gemini-1.5-flash"
        ];

        let result;
        let usedModel = "";
        let lastError;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `
                    Você é um professor especialista criando uma prova.
                    
                    Tópico: ${topic}
                    Nível de Ensino: ${level}
                    Ano Escolar/Série: ${year}
                    Dificuldade: ${difficulty}
                    
                    Gere 3 questões seguindo estritamente este nível, ano escolar e dificuldade. Use vocabulário adequado para a idade dos alunos desta etapa formativa.
                    Gere APENAS questões de múltipla escolha.
                    Como especialista, identifique o código da habilidade da BNCC mais adequado para cada questão.
                    
                    Responda APENAS com um JSON válido seguindo esta estrutura, sem markdown (backticks):
                    {
                        "questions": [
                            {
                                "text": "Enunciado da questão",
                                "type": "multiple_choice",
                                "options": ["Opção A", "Opção B", "Opção C", "Opção D", "Opção E"],
                                "correct": "A",
                                "habilidade": "EF06HI02"
                            }
                        ]
                    }
                `;

                result = await model.generateContent(prompt);
                usedModel = modelName;
                break; // If successful, exit loop
            } catch (e) {
                console.warn(`Failed with model ${modelName}:`, e.message);
                lastError = e;
                continue;
            }
        }

        if (!result) {
            throw lastError || new Error("Todos os modelos falharam.");
        }

        const response = await result.response;
        let text = response.text();

        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(text);
            // Add unique IDs
            data.questions = data.questions.map((q, i) => ({ ...q, id: Date.now() + i }));
            return NextResponse.json(data);
        } catch (e) {
            console.error("JSON Parse Error", e, text);
            return NextResponse.json({ error: "Erro ao processar resposta da IA" }, { status: 500 });
        }

    } catch (error) {
        console.error("AI API Error", error);
        return NextResponse.json({ error: `[PROJETO-CORRIGE] ${error.message}` }, { status: 500 });
    }
}
