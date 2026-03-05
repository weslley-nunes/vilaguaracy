import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio" } = await req.json();

        // Use Gemini API Key
        const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY; // Fallback to avoid breaking if they put it in the old var

        if (!apiKey || apiKey.startsWith("your_")) {
            // Mock Data when no valid key is present
            await new Promise(r => setTimeout(r, 1000));
            return NextResponse.json({
                questions: [
                    {
                        id: Date.now() + 1,
                        type: 'multiple_choice',
                        text: `MOCK: Questão de ${topic} (${difficulty}) para ${level}`,
                        options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
                        correct: 'A',
                        bncc: 'EF06HI02'
                    },
                    {
                        id: Date.now() + 2,
                        type: 'text',
                        text: `MOCK: Explique o conceito de ${topic} considerando o nível ${level}.`,
                        bncc: 'EM13CHS101'
                    }
                ]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // List of models to try in order of preference/likelihood of working
        const modelsToTry = [
            "gemini-2.5-flash",
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
                    Dificuldade: ${difficulty}
                    
                    Gere 3 questões seguindo estritamente este nível e dificuldade.
                    Misture questões de múltipla escolha e dissertativas.
                    Como especialista, identifique o código da habilidade da BNCC (Base Nacional Comum Curricular) mais adequado para cada questão.
                    
                    Responda APENAS com um JSON válido seguindo esta estrutura, sem markdown (backticks):
                    {
                        "questions": [
                            {
                                "text": "Enunciado da questão",
                                "type": "multiple_choice" | "text",
                                "options": ["Opção A", "Opção B", "Opção C", "Opção D"], // Apenas se for multiple_choice
                                "correct": "A", // Letra da correta ou resposta esperada
                                "bncc": "EF06HI02" // Código da BNCC (ou "N/A" se não aplicável)
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
                // If it's a 429 specific to quota 0, we continue. 
                // If it's 404, we continue.
                continue;
            }
        }

        if (!result) {
            throw lastError || new Error("All models failed.");
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
            console.error("JSON Parse Error", e);
            console.log("Raw Text:", text);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

    } catch (error) {
        console.error("AI API Error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
