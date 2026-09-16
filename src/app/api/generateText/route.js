import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { questionText, subject } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Chave não configurada no servidor." }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
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
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = `
                    Você é um professor especialista da disciplina de ${subject}.
                    Abaixo está o enunciado de uma questão de múltipla escolha:
                    
                    "${questionText}"
                    
                    Sua tarefa é gerar um texto de apoio (um conto, um poema, um texto informativo, um estudo de caso ou uma notícia) que sirva como base de leitura ANTES desta questão.
                    
                    REGRAS:
                    1. O texto deve ser RICO e bem formatado em HTML básico.
                    2. Use as tags HTML: <b>, <i>, <br>, <p>, <h3> (para título), e <div style="text-align: justify"> ou <div style="text-align: center"> quando apropriado (ex: centralize poemas).
                    3. NÃO coloque o texto dentro de blocos de código ou markdown (sem \`\`\`html).
                    4. Retorne APENAS o HTML final pronto para ser renderizado.
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let text = response.text().trim();
                
                // Limpar blocos markdown se a IA colocar
                text = text.replace(/```html/g, '').replace(/```/g, '').trim();
                
                return NextResponse.json({ supportText: text });
            } catch (e) {
                lastError = `Erro no modelo ${modelName}: ${e.message}`;
                continue;
            }
        }

        throw new Error(lastError || "Nenhum modelo funcionou.");

    } catch (error) {
        let msg = error.message;
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
