import { NextResponse } from 'next/server';
// AI Question Generation Route - Force Redeploy after Key Cleanup
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral", count = 3 } = await req.json();

        // Use Gemini API Key exclusively
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Configuração incompleta: GEMINI_API_KEY não encontrada no servidor." }, { status: 500 });
        }

        if (apiKey.startsWith("your_") || apiKey.length < 10) {
            // Mock Data when no valid key is present
            await new Promise(r => setTimeout(r, 1000));
            
            const mockQuestions = [];
            for (let i = 0; i < count; i++) {
                mockQuestions.push({
                    id: Date.now() + i,
                    type: 'multiple_choice',
                    text: `MOCK: Questão ${i+1} de ${topic} (${difficulty}) para ${level} - ${year}`,
                    options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D', 'Alternativa E'],
                    correct: 'A',
                    habilidade: 'EF06HI02 - Mock Habilidade'
                });
            }

            return NextResponse.json({
                questions: mockQuestions
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // List of models to try in order of preference/likelihood of working
        const modelsToTry = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro"
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
                    Quantidade de questões: ${count}
                    
                    Gere ${count} questões seguindo estritamente este nível, ano escolar e dificuldade. Use vocabulário adequado para a idade dos alunos desta etapa formativa.
                    Gere APENAS questões de múltipla escolha. NUNCA gere questões dissertativas.
                    Como especialista, identifique a habilidade (ou código da BNCC) mais adequada que está sendo avaliada em cada questão.
                    
                    Responda APENAS com um JSON válido seguindo esta estrutura, sem markdown (backticks):
                    {
                        "questions": [
                            {
                                "text": "Enunciado da questão",
                                "type": "multiple_choice",
                                "options": ["Opção A", "Opção B", "Opção C", "Opção D", "Opção E"],
                                "correct": "A",
                                "habilidade": "EF06HI02 - Identificar a gênese da produção..." // Código e descrição da habilidade
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
        
        // Diagnóstico para o usuário
        const apiKey = process.env.GEMINI_API_KEY;
        const keyPreview = apiKey ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : "NÃO ENCONTRADA";
        const diagnosticMsg = `Erro na IA: ${error.message}. \nChave detectada: ${keyPreview} (Tamanho: ${apiKey?.length}). \nVerifique se esta chave está correta no Coolify.`;
        
        return NextResponse.json({ error: diagnosticMsg }, { status: 500 });
    }
}
// Trigger
