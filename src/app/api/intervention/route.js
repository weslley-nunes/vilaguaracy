import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { skill, hitRate, className } = await req.json();

        // Lendo diretamente das variáveis de ambiente
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Chave não configurada no servidor." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Lista robusta de modelos com fallback atualizada
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
                    Você é um coordenador pedagógico especialista em análise de dados e metodologias ativas.
                    Habilidade Crítica: ${skill}
                    Taxa de Acerto: ${hitRate}%
                    Turma: ${className || "Todas as turmas"}
                    
                    Gere uma sugestão de intervenção pedagógica direta, prática e aplicável em sala de aula para o professor responsável melhorar a proficiência dos alunos nesta habilidade.
                    A sugestão deve conter:
                    1. Uma breve análise do porquê a taxa de acerto pode estar baixa.
                    2. Uma estratégia metodológica prática (ex: rotação por estações, gamificação, debate, etc).
                    3. Um exemplo de atividade ou condução de aula para essa habilidade.
                    
                    REGRAS CRÍTICAS DE SAÍDA:
                    1. RETORNE EXCLUSIVAMENTE O JSON ABAIXO.
                    2. NÃO ADICIONE NENHUM TEXTO ANTES, DEPOIS OU FORA DO JSON.
                    3. NÃO USE MARCADORES DE MARKDOWN (\`\`\`json).
                    
                    Formato EXATO:
                    {
                        "analysis": "Breve análise de 1 frase...",
                        "methodology": "Nome da metodologia ativa sugerida",
                        "activity": "Descrição prática da atividade em 2 a 3 frases."
                    }`;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
                
                const data = JSON.parse(text);
                
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
            msg = "Limite de requisições excedido na IA. Por favor, aguarde cerca de 1 minuto antes de tentar gerar novamente.";
        }
        return NextResponse.json({ error: `[ERRO IA] ${msg}` }, { status: 500 });
    }
}
