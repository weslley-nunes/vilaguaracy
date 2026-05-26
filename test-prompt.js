const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });
const apiKey = process.env.GEMINI_API_KEY;

async function testPrompt() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
                    Você é um professor especialista criando uma prova.
                    Tópico: Equações
                    Nível de Ensino: Ensino Médio
                    Ano Escolar/Série: 1ª Série
                    Dificuldade: Fácil
                    Gere 3 questões estritamente OBJETIVAS (múltipla escolha).
                    CADA questão DEVE ter EXATAMENTE 4 alternativas (A, B, C, D).
                    Como especialista, identifique e insira o código da habilidade da BNCC correspondente para CADA questão.
                    
                    REGRAS PARA O ENUNCIADO:
                    1. O enunciado de CADA questão DEVE iniciar obrigatoriamente com um verbo de comando da Taxonomia de Bloom (exemplos: **Analise**, **Compare**, **Identifique**, **Calcule**, **Classifique**, **Explique**, **Diferencie**, **Relacione**).
                    2. Este verbo de comando DEVE estar em destaque (negrito) utilizando exatamente dois asteriscos no início e no fim do verbo, por exemplo: "**Analise** a situação..." ou "**Calcule** o valor...".
                    
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

        console.log("Gerando...");
        const result = await model.generateContent(prompt);
        const text = await result.response.text();
        console.log("TEXTO BRUTO:");
        console.log(text);
        
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        JSON.parse(cleanText);
        console.log("JSON PARSED SUCCESSFULLY!");
    } catch (e) {
        console.error("ERRO:", e);
    }
}

testPrompt();
