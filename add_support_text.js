const fs = require('fs');

let builderCode = fs.readFileSync('src/app/(dashboard)/builder/page.js', 'utf8');

// 1. Import RichTextEditor
if (!builderCode.includes("RichTextEditor")) {
    const importTarget = `import ExamPaper from "@/components/ExamPaper";`;
    const importReplacement = `import ExamPaper from "@/components/ExamPaper";\nimport RichTextEditor from "@/components/RichTextEditor";`;
    builderCode = builderCode.replace(importTarget, importReplacement);
}

// 2. Add isGeneratingText state
const stateTarget = `const [isGenerating, setIsGenerating] = useState(false);`;
const stateReplacement = `const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingText, setIsGeneratingText] = useState(false);`;
builderCode = builderCode.replace(stateTarget, stateReplacement);

// 3. Add handle text generation function
const funcTarget = `const removeQuestion = (id) => {`;
const funcReplacement = `const generateSupportText = async () => {
        if (!manualQuestion.text) return alert("Escreva a questão primeiro!");
        setIsGeneratingText(true);
        try {
            const res = await fetch('/api/generateText', {
                method: 'POST',
                body: JSON.stringify({ questionText: manualQuestion.text, subject })
            });
            const data = await res.json();
            if (data.supportText) {
                setManualQuestion({ ...manualQuestion, supportText: data.supportText });
            } else {
                alert("Erro ao gerar texto: " + (data.error || "Desconhecido"));
            }
        } catch (e) {
            alert("Erro de conexão.");
        } finally {
            setIsGeneratingText(false);
        }
    };

    const removeQuestion = (id) => {`;
builderCode = builderCode.replace(funcTarget, funcReplacement);

// 4. Update the Manual Modal UI
// Find `<div><label className="block text-sm font-bold text-gray-700 mb-1">Enunciado</label><textarea...`
const uiTarget = `<div><label className="block text-sm font-bold text-gray-700 \nmb-1">Enunciado</label><textarea value={manualQuestion.text}`;
// Need to be careful with regex due to newlines and encoding. Let's just find "Enunciado</label>"
const uiRegex = /<div><label className="block text-sm font-bold text-gray-700 mb-1">Enunciado<\/label><textarea value=\{manualQuestion\.text\} onChange=\{\(e\) => setManualQuestion\(\{ \.\.\.manualQuestion, text: e\.target\.value \}\)\} className="w-full p-3 rounded-lg border border-gray-300 focus:border-vg-dark outline-none min-h-\[100px\]" placeholder="Digite a pergunta aqui\.\.\." \/><\/div>/;

const uiReplacementText = `
                            {/* Texto de Apoio */}
                            <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Texto de Apoio (Opcional)</label>
                                    {["História", "Geografia", "Filosofia", "Sociologia", "Língua Portuguesa", "Língua Inglesa", "Arte"].includes(subject) && (
                                        <button type="button" onClick={generateSupportText} disabled={isGeneratingText} className="text-xs btn btn-primary py-1 px-3 flex items-center gap-1 shadow-sm">
                                            {isGeneratingText ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                                            {isGeneratingText ? 'Gerando...' : 'Gerar com IA'}
                                        </button>
                                    )}
                                </div>
                                <RichTextEditor 
                                    value={manualQuestion.supportText || ""} 
                                    onChange={(val) => setManualQuestion({...manualQuestion, supportText: val})} 
                                    placeholder="Escreva ou gere um texto (poema, conto, etc) para acompanhar a questão..."
                                />
                            </div>
                            
                            <div><label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-200">Enunciado da Questão</label><textarea value={manualQuestion.text} onChange={(e) => setManualQuestion({ ...manualQuestion, text: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:border-vg-dark outline-none min-h-[100px]" placeholder="Digite a pergunta aqui..." /></div>`;

builderCode = builderCode.replace(uiRegex, uiReplacementText);

fs.writeFileSync('src/app/(dashboard)/builder/page.js', builderCode, 'utf8');
console.log("Builder page updated for support text.");
