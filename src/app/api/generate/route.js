import { NextResponse } from 'next/server';
// AI Question Generation Route - Direct Connection (No SDK)
// This avoids 404 errors from library-forced v1beta endpoints

export async function POST(req) {
    try {
        const { topic, difficulty = "Médio", level = "Ensino Médio", year = "Geral", count = 3 } = await req.json();

        // Use Gemini API Key exclusively
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Configuração incompleta: GEMINI_API_KEY não encontrada." }, { status: 500 });
        }

        if (apiKey.startsWith("your_") || apiKey.length < 10) {
            // Mock Data when no valid key is present
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
            return NextResponse.json({ questions: mockQuestions });
        }

        // Direct fetch to Gemini API v1 (Stable)
        // Using gemini-1.5-flash which is the most reliable model
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
                        "habilidade": "EF06HI02 - Identificar a gênese da produção..."
                    }
                ]
            }
        `;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // DIAGNOSTIC: If 404, list available models
            if (response.status === 404) {
                try {
                    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
                    const listData = await listRes.json();
                    const availableModels = listData.models?.map(m => m.name.replace('models/', '')).join(', ') || "Nenhum modelo encontrado";
                    throw new Error(`Modelo não encontrado. Modelos disponíveis para sua chave: ${availableModels}`);
                } catch (listErr) {
                    throw new Error(`Google API Error (404): O modelo gemini-1.5-flash não foi encontrado e não conseguimos listar alternativas.`);
                }
            }
            
            throw new Error(`Google API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("A IA não retornou conteúdo válido.");
        }

        let text = data.candidates[0].content.parts[0].text;
        
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsedData = JSON.parse(text);
            parsedData.questions = parsedData.questions.map((q, i) => ({ ...q, id: Date.now() + i }));
            return NextResponse.json(parsedData);
        } catch (e) {
            console.error("JSON Parse Error", e, text);
            return NextResponse.json({ error: "Falha ao processar resposta da IA." }, { status: 500 });
        }

    } catch (error) {
        console.error("AI API Error", error);
        const apiKey = process.env.GEMINI_API_KEY;
        const keyPreview = apiKey ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}` : "NÃO ENCONTRADA";
        
        return NextResponse.json({ 
            error: `[V3-DIRECT] Erro na IA: ${error.message}. \nChave detectada: ${keyPreview}` 
        }, { status: 500 });
    }
}
