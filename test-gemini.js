const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testKey() {
    const apiKey = "AIzaSyASJEMYVXfEGJbJlgGXFBHPDcWG5QWrbnw";
    console.log("Testando chave:", apiKey.substring(0, 10) + "...");
    
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log("Tentando gerar conteúdo...");
        const result = await model.generateContent("Diga 'Olá Mundo' se estiver funcionando.");
        const response = await result.response;
        console.log("RESPOSTA DO GOOGLE:", response.text());
    } catch (error) {
        console.error("ERRO NO TESTE:", error.message);
        if (error.stack) console.error(error.stack);
    }
}

testKey();
