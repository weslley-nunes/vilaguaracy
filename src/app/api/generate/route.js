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

        // Lista robusta de modelos com fallback atualizada com os modelos mais recentes do Gemini 3.x e 2.x
        const modelsToTry = [
            "gemini-3.5-flash",
            "gemini-3.1-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.5-pro"
        ];

        let lastError = "";

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: { responseMimeType: "application/json" }
                });

                const prompt = `
                    Você é um professor especialista criando uma prova.
                    Tópico: ${topic}
                    Nível de Ensino: ${level}
                    Ano Escolar/Série: ${year}
                    Dificuldade: ${difficulty}
                    Gere 3 questões estritamente OBJETIVAS (múltipla escolha).
                    CADA questão DEVE ter EXATAMENTE 4 alternativas (A, B, C, D).
                    Como especialista, identifique e insira o código da habilidade da BNCC correspondente para CADA questão.
                    
                    REGRAS PARA O ENUNCIADO:
                    1. O enunciado de CADA questão DEVE iniciar obrigatoriamente com um verbo de comando da Taxonomia de Bloom (exemplos: **Analise**, **Compare**, **Identifique**, **Calcule**, **Classifique**, **Explique**, **Diferencie**, **Relacione**).
                    2. Este verbo de comando DEVE estar em destaque (negrito) utilizando exatamente dois asteriscos no início e no fim do verbo, por exemplo: "**Analise** a situação..." ou "**Calcule** o valor...".
                    
                    REGRAS CRÍTICAS DE SAÍDA:
                    1. RETORNE EXCLUSIVAMENTE O JSON ABAIXO.
                    2. NÃO ADICIONE NENHUM TEXTO ANTES, DEPOIS OU FORA DO JSON.
                    3. NÃO USE MARCADORES DE MARKDOWN (\`\`\`json).
                    
                    Formato EXATO:
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
        let msg = error.message;
        if (msg.includes("429") || msg.includes("Quota exceeded") || msg.includes("quota") || msg.includes("Too Many Requests")) {
            msg = "Limite de requisições excedido na IA (Quota Exceeded). Por favor, aguarde cerca de 1 minuto antes de tentar gerar novamente.";
        }
        return NextResponse.json({ error: `[ERRO CRÍTICO 2.0] ${msg}` }, { status: 500 });
    }
}
