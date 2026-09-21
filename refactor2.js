const fs = require('fs');

const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

// The logic needs to be injected before `return (` of ExamPaper component.
// I will find `const spacing = isAdapted ? 'space-y-8' : 'space-y-6';` and insert the usedVerbs logic after it.
const verbLogicStr = `
    const verbDictionary = {
        'citar': 'Apresente informações sem detalhar.',
        'completar': 'Preencha lacunas com informações.',
        'conceituar': 'Dê a definição. Diga o que é.',
        'definir': 'Dê a definição. Diga o que é.',
        'diferenciar': 'Mostre características não iguais.',
        'exemplificar': 'Exemplos que deem forma ao conceito.',
        'explicar': 'O que é + como funciona + por que.',
        'justificar': 'Evidências em forma de fatos.',
        'nomeie': 'Forma cientificamente chamada.',
        'relacionar': 'Conecte informações pedidas.',
        'analise': 'Estude detalhadamente.',
        'compare': 'Examine semelhanças e diferenças.',
        'identifique': 'Reconheça e indique algo.',
        'calcule': 'Determine o valor.',
        'classifique': 'Agrupe de acordo com características.'
    };
    const usedVerbs = new Set();
    const allText = flatQuestions.map(q => (q.text || "").toLowerCase()).join(" ");
    Object.keys(verbDictionary).forEach(verb => {
        if (allText.includes(\`**\${verb}**\`) || allText.match(new RegExp(\`\\\\b\${verb}\\\\b\`))) {
            usedVerbs.add(verb);
        }
    });
    const usedVerbsList = Array.from(usedVerbs).sort();
`;

// Inject logic
if (!code.includes('const usedVerbsList = Array.from(usedVerbs).sort();')) {
    const targetAnchor = "const lineHeight = isAdapted ? 'leading-relaxed' : '';";
    code = code.replace(targetAnchor, targetAnchor + "\n\n" + verbLogicStr);
}


// Replace the layout
const startTag = '{/* Split Section: Instructions, Tabelinha & Answer Sheet */}';
const endTag = '{/* Questions List Grouped by Blocks */}';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find boundaries.");
    process.exit(1);
}

const replacement = `{/* Split Section: Instructions, Tabelinha & Answer Sheet */}
            <div className="flex flex-row items-stretch gap-6 mb-6 w-full">
                {/* Left Column: Instructions & Tabelinha */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Instructions */}
                    <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 print:bg-transparent print:border-black">
                        <h3 className="font-bold text-[12px] uppercase mb-2">📝 Orientações Importantes:</h3>
                        <p className={\`text-[11px] \${isAdapted ? 'text-[18px]' : ''} font-medium text-gray-800 leading-snug\`}>
                            Caneta: Utilize apenas caneta azul ou preta. <br/>
                            Questões: A prova possui {flatQuestions.length} questões com alternativas de A a D. <br/>
                            Resposta: Marque apenas uma alternativa por questão. <br/>
                            Gabarito: Pinte a bolinha correspondente à sua resposta com muito cuidado e sem ultrapassar as bordas. <br/><br/>
                            Nossa escola preparou você com muito carinho e dedicação. Acreditamos no seu esforço e confiamos plenamente no seu potencial! Boa avaliação!
                        </p>
                    </div>

                    {/* Tabelinha dos Comandos - Only render if used */}
                    {usedVerbsList.length > 0 && (
                        <div className="w-full">
                            <table className={\`w-full border-collapse border border-black \${isAdapted ? 'text-[12px] border-2' : 'text-[10px]'} text-left print:border-black\`}>
                                <thead>
                                    <tr>
                                        <th colSpan="2" className="border border-black text-center font-bold uppercase py-1 bg-gray-100 print:bg-transparent print:border-black">Tabelinha dos Comandos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usedVerbsList.map(verb => (
                                        <tr key={verb}>
                                            <td className="border border-black px-2 py-1 font-bold print:border-black w-[100px] capitalize">{verb}</td>
                                            <td className="border border-black px-2 py-1 print:border-black">{verbDictionary[verb]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Column: INTEGRATED ANSWER SHEET (Optimized for Vertical Photo) */}
                {multipleChoiceQuestions.length > 0 && (
                    <div className="w-[420px] shrink-0 border-[3px] border-black p-4 bg-white print:bg-transparent relative flex flex-col items-center print:break-inside-avoid">
                        {/* High-Precision Alignment Markers (24x24px anchor points) */}
                        <div className="absolute top-0 left-0 w-6 h-6 bg-black print:block"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 bg-black print:block"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 bg-black print:block"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-black print:block"></div>

                        {/* Title and ID block inside answer sheet */}
                        <div className="flex w-full items-center justify-between mb-3 px-2 mt-2 border-b border-black pb-2">
                            <div className="flex-1 flex flex-col items-start pr-2">
                                <p className="text-sm font-bold uppercase tracking-widest w-full">Folha de Respostas</p>
                                <span className="text-[10px] uppercase font-bold text-gray-800 leading-tight mt-1">
                                    {headerConfig?.accessCode ? \`ALUNO: \${headerConfig.accessCode}\` : (studentName.slice(0, 25) || "_____________________")}
                                </span>
                            </div>
                            <div className="shrink-0 flex flex-col items-center bg-gray-50 border border-gray-200 p-1.5 rounded-lg print:border-black">
                                <QRCodeSVG
                                    value={\`\${typeof window !== 'undefined' ? window.location.origin : 'https://vilaguaracy.com.br'}/scanner?id=\${examId}&s=\${encodeURIComponent(studentName)}&ac=\${encodeURIComponent(headerConfig?.accessCode || "")}\${headerConfig?.classId ? \`&c=\${encodeURIComponent(headerConfig.classId)}\` : ''}\`}
                                    size={60}
                                    level="H"
                                />
                                <div className="text-black px-1 py-0.5 text-[8px] font-black tracking-widest mt-0.5">
                                    ID: {examId.slice(-6).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Bubbles Grid */}
                        <div className="w-full flex flex-wrap gap-x-6 gap-y-4 justify-center">
                            {(() => {
                                const columnBlocks = [];
                                let globalIdx = 1;
                                
                                const subjectsMap = new Map();
                                multipleChoiceQuestions.forEach(q => {
                                    const sub = q.subject || "Geral";
                                    subjectsMap.set(sub, (subjectsMap.get(sub) || 0) + 1);
                                });
                                
                                subjectsMap.forEach((quota, subject) => {
                                    let remaining = quota;
                                    let subBlockIdx = 0;
                                    
                                    while (remaining > 0) {
                                        const currentBatch = Math.min(remaining, 10);
                                        const startIdx = globalIdx;
                                        globalIdx += currentBatch;
                                        
                                        columnBlocks.push({
                                            subject: subBlockIdx === 0 ? subject : \`\${subject} (cont.)\`,
                                            count: currentBatch,
                                            startNumber: startIdx
                                        });
                                        
                                        remaining -= currentBatch;
                                        subBlockIdx++;
                                    }
                                });
                                
                                return columnBlocks.map((block, bIdx) => (
                                    <div key={bIdx} className="w-[155px] border-t-2 border-black pt-1">
                                        <p className={\`font-black uppercase mb-3 text-center truncate \${isAdapted ? 'text-[14px]' : 'text-[9px]'}\`}>{block.subject}</p>
                                        <div className="space-y-3">
                                            {Array.from({ length: block.count }).map((_, i) => {
                                                const qNum = block.startNumber + i;
                                                return (
                                                    <div key={i} className={\`flex items-center justify-between \${isAdapted ? 'text-[16px]' : 'text-[11px]'}\`}>
                                                        <span className={\`font-black text-right pr-2 \${isAdapted ? 'w-8' : 'w-6'}\`}>{qNum}.</span>
                                                        <div className="flex gap-2">
                                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                                <div key={opt} className={\`rounded-full border-[1.5px] border-black bg-white flex items-center justify-center font-bold \${isAdapted ? 'w-8 h-8 text-[14px]' : 'w-5 h-5 text-[10px]'}\`}>
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                        <div className="mt-4 text-[10px] font-bold uppercase text-gray-500 text-center">
                            FOTOGRAFE ESTA ÁREA NA VERTICAL
                        </div>
                    </div>
                )}
            </div>

            `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync(path, code, 'utf8');
console.log("Refactored successfully.");
