const fs = require('fs');

const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

const startTag = '{/* Split Section: Instructions + QR Code */}';
const endTag = '{/* Questions List Grouped by Blocks */}';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find boundaries.");
    process.exit(1);
}

const replacement = `{/* Split Section: Instructions, Tabelinha & Answer Sheet */}
            <div className="flex flex-row items-stretch gap-4 mb-6 w-full">
                {/* Left Column: Instructions & Tabelinha */}
                <div className="flex-1 flex flex-col gap-3">
                    {/* Instructions */}
                    <div className="border border-gray-300 p-3 rounded-lg bg-gray-50 print:bg-transparent print:border-black">
                        <h3 className="font-bold text-[11px] uppercase mb-1">📝 Orientações Importantes:</h3>
                        <p className={\`text-[10px] \${isAdapted ? 'text-[18px]' : ''} font-medium text-gray-800\`}>
                            Caneta: Utilize apenas caneta azul ou preta. <br/>
                            Questões: A prova possui {flatQuestions.length} questões com alternativas de A a D. <br/>
                            Resposta: Marque apenas uma alternativa por questão. <br/>
                            Gabarito: Pinte a bolinha correspondente à sua resposta com muito cuidado e sem ultrapassar as bordas. <br/><br/>
                            Nossa escola preparou você com muito carinho e dedicação. Acreditamos no seu esforço e confiamos plenamente no seu potencial! Boa avaliação!
                        </p>
                    </div>

                    {/* Tabelinha dos Comandos */}
                    <div className="w-full">
                        <table className={\`w-full border-collapse border border-black \${isAdapted ? 'text-[12px] border-2' : 'text-[9px]'} text-left print:border-black\`}>
                            <thead>
                                <tr>
                                    <th colSpan="2" className="border border-black text-center font-bold uppercase py-0.5 bg-gray-100 print:bg-transparent print:border-black">Tabelinha dos Comandos</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black w-[90px]">Citar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Apresente informações sem detalhar.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Completar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Preencha lacunas com informações.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Conceituar/Definir</td><td className="border border-black px-1.5 py-0.5 print:border-black">Dê a definição. Diga o que é.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Diferenciar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Mostre características não iguais.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Exemplificar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Exemplos que deem forma ao conceito.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Explicar</td><td className="border border-black px-1.5 py-0.5 print:border-black">O que é + como funciona + por que.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Justificar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Evidências em forma de fatos.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Nomeie</td><td className="border border-black px-1.5 py-0.5 print:border-black">Forma cientificamente chamada.</td></tr>
                                <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Relacionar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Conecte informações pedidas.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: INTEGRATED ANSWER SHEET (Optimized for Vertical Photo) */}
                {multipleChoiceQuestions.length > 0 && (
                    <div className="w-[340px] shrink-0 border-[3px] border-black p-4 bg-white print:bg-transparent relative flex flex-col items-center print:break-after-page print:break-inside-avoid">
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
                        <div className="w-full flex flex-wrap gap-x-4 gap-y-4 justify-center">
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
                                        const currentBatch = Math.min(remaining, 15);
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
                                    <div key={bIdx} className="w-[145px] border-t-2 border-black pt-1">
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

const newCode = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync(path, newCode, 'utf8');
console.log("Replaced block successfully.");
