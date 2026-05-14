import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const ExamPaper = forwardRef(({ questions, title, collaborators = [], headerConfig, showAnswers = false, isAdapted = false, scoringMode = "auto", totalScore = 3, onQuestionChange = null, printConfig = {} }, ref) => {
    // Determine exam ID for QR (fallback to timestamp if not provided in headerConfig)
    const examId = headerConfig?.examId || "PREVIEW";
    const studentName = headerConfig?.studentName || "";

    // Accessibility Styles
    const fontStyle = isAdapted ? { fontFamily: 'Verdana, sans-serif' } : { fontFamily: 'Times New Roman, serif' };
    const baseTextSize = isAdapted ? 'text-lg' : 'text-base';
    const titleSize = isAdapted ? 'text-3xl' : 'text-2xl';
    const spacing = isAdapted ? 'space-y-8' : 'space-y-6';
    const lineHeight = isAdapted ? 'leading-relaxed' : '';


    // Group questions for Answer Grid (2 cols max in grid to avoid overflow)
    const multipleChoiceQuestions = questions.filter(q => q.type === 'multiple_choice');
    const questionsPerCol = Math.ceil(multipleChoiceQuestions.length / 2) || 5;
    const gridColumns = [];
    if (multipleChoiceQuestions.length > 0) {
        for (let i = 0; i < multipleChoiceQuestions.length; i += questionsPerCol) {
            gridColumns.push(multipleChoiceQuestions.slice(i, i + questionsPerCol));
        }
    }

    return (
        <div ref={ref} className={`bg-white p-12 shadow-lg min-h-[1123px] w-[794px] mx-auto text-black print:shadow-none print:w-full relative ${isAdapted ? 'text-lg' : ''}`} style={fontStyle}>

            {/* Header */}
            <div className="mb-4">
                {headerConfig?.useCustomHeader && headerConfig?.customHeaderImageUrl ? (
                    <div className="w-full flex items-center justify-center mb-4 border-b-2 border-black pb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={headerConfig.customHeaderImageUrl} alt="Cabeçalho Personalizado" className="w-full h-auto object-contain" />
                    </div>
                ) : (
                    <div className="border-2 border-black rounded-[24px] p-4 flex gap-6 items-stretch">
                        {/* Left: School Logo */}
                        <div className="w-[120px] shrink-0 flex items-center justify-center">
                            {headerConfig?.logoUrl ? (
                                <img src={headerConfig.logoUrl} alt="Logo Escola" className="w-full h-auto object-contain" />
                            ) : (
                                <div className="border border-black p-2 text-[10px] w-full h-24 flex items-center justify-center text-center text-gray-400">
                                    Logotipo
                                </div>
                            )}
                        </div>

                        {/* Right: Info */}
                        <div className="flex-1 flex flex-col justify-between py-1 text-[13px] leading-relaxed">
                            {/* Row 1 */}
                            <div className="flex justify-between items-start mb-2">
                                <h1 className="text-[17px] font-black tracking-wide">{headerConfig?.schoolName || "ESCOLA ESTADUAL VILA GUARACY"}</h1>
                                <div className="w-[160px] -mt-1">
                                    <img src="/seduc-logo.png" alt="SEDUC Tocantins" className="w-full h-auto object-contain" />
                                </div>
                            </div>
                            
                            {/* Row 2 */}
                            <div className="flex justify-between w-[95%]">
                                <p>Gurupi, _____ / _____ / 2026</p>
                                <p>2º Bimestre</p>
                                <p>Turma: {headerConfig?.className || "82.____"}</p>
                            </div>

                            {/* Row 3 */}
                            <div>
                                <p>Componente Curricular: <span className="inline-block w-[350px] border-b border-black"></span></p>
                            </div>

                            {/* Row 4 */}
                            <div>
                                <p>Professor: <strong>{[headerConfig?.teacherName, ...collaborators.map(c => c.name)].filter(Boolean).join(", ") || "Weslley Nunes da Silva"}</strong></p>
                            </div>

                            {/* Row 5 */}
                            <div className="mt-1">
                                <p>Estudante: <span className="inline-block w-[500px] border-b border-black">{studentName || ""}</span></p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-5 text-center">
                    <h2 className={`${titleSize} font-bold uppercase`}>{title || "Avaliação"} {isAdapted && <span className="text-[12px] block normal-case mt-1">(Prova Adaptada - Fonte Ampliada)</span>}</h2>
                </div>
            </div>

            {/* Split Section: Instructions + QR Code */}
            <div className="flex flex-row items-stretch gap-4 mb-4 w-full">
                {/* Instructions */}
                <div className="flex-1 border border-gray-300 p-3 rounded-lg bg-gray-50 print:bg-transparent print:border-black">
                    <h3 className="font-bold text-[11px] uppercase mb-1">📝 Orientações Importantes:</h3>
                    <p className={`text-[10px] ${isAdapted ? 'text-lg' : ''} font-medium text-gray-800`}>
                        Caneta: Utilize apenas caneta azul ou preta. <br/>
                        Questões: A prova possui {questions.length} questões com alternativas de A a D. <br/>
                        Resposta: Marque apenas uma alternativa por questão. <br/>
                        Gabarito: Pinte a bolinha correspondente à sua resposta com muito cuidado e sem ultrapassar as bordas. <br/><br/>
                        Nossa escola preparou você com muito carinho e dedicação. Acreditamos no seu esforço e confiamos plenamente no seu potencial! Boa avaliação!
                    </p>
                </div>

                {/* QR Code */}
                {multipleChoiceQuestions.length > 0 && (
                    <div className="w-[150px] shrink-0 flex flex-col items-center justify-center p-2 border border-gray-300 print:border-black rounded-lg bg-white">
                        <QRCodeSVG
                            value={`${typeof window !== 'undefined' ? window.location.origin : 'https://vilaguaracy.com.br'}/scanner?id=${examId}&s=${encodeURIComponent(studentName)}&ac=${encodeURIComponent(headerConfig?.accessCode || "")}${headerConfig?.classId ? `&c=${encodeURIComponent(headerConfig.classId)}` : ''}`}
                            size={90}
                            level="H"
                        />
                        <div className="mt-1 flex flex-col items-center w-full px-1 text-center">
                            <div className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black tracking-widest mb-1">CÓDIGO: {examId.slice(-6).toUpperCase()}</div>
                            <span className="text-[8px] uppercase font-bold text-gray-600 leading-tight">{studentName.slice(0, 25) || "_____________________"}</span>
                            <span className="text-[7px] text-gray-400 mt-1">Consulte o gabarito em vilaguaracy.com.br</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabelinha dos Comandos */}
            <div className="mb-6 w-full">
                <table className="w-full border-collapse border border-black text-[9px] text-left print:border-black">
                    <thead>
                        <tr>
                            <th colSpan="2" className="border border-black text-center font-bold uppercase py-0.5 bg-gray-100 print:bg-transparent print:border-black">Tabelinha dos Comandos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold w-[120px] print:border-black">Citar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Apresente informações sem necessidade de detalhar.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Completar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Use palavras ou expressões que preencham lacunas com informações corretas.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Conceituar/Definir</td><td className="border border-black px-1.5 py-0.5 print:border-black">Dê a definição. Diga o que é.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Diferenciar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Mostre características que façam com que as informações não sejam iguais.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Exemplificar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Apresente exemplos que dê forma à ideia ou conceito.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Explicar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Dizer o que é + como funciona + por que é assim.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Justificar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Apresentar evidências em forma de fatos e não de opiniões.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Nomeie</td><td className="border border-black px-1.5 py-0.5 print:border-black">Apresentar o nome, a forma como algo é cientificamente chamado.</td></tr>
                        <tr><td className="border border-black px-1.5 py-0.5 font-bold print:border-black">Relacionar</td><td className="border border-black px-1.5 py-0.5 print:border-black">Apresente informações e conecte com o que é pedido.</td></tr>
                    </tbody>
                </table>
            </div>

            {/* INTEGRATED ANSWER SHEET - Standardized Square for Precise Capture */}
            {multipleChoiceQuestions.length > 0 && (
                <div className="print:break-after-page mb-6 border-2 border-black p-4 bg-white print:bg-transparent relative w-full mx-auto flex flex-col items-center justify-center">
                    {/* High-Precision Alignment Markers */}
                    <div className="absolute top-0 left-0 w-4 h-4 bg-black print:block"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 bg-black print:block"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 bg-black print:block"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-black print:block"></div>

                    <p className="text-center text-sm font-bold uppercase mb-4 tracking-widest border-b border-black pb-2 w-full">Folha de Respostas Oficial</p>
                    
                    <div className="w-full px-4 mb-2">
                        {/* Bubbles Grid Section Grouped by Blocks */}
                        <div className="w-full flex flex-wrap gap-4 justify-center">
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
                                        const currentBatch = Math.min(remaining, 5);
                                        const startIdx = globalIdx;
                                        globalIdx += currentBatch;
                                        
                                        columnBlocks.push({
                                            subject: subBlockIdx === 0 ? subject : `${subject} (cont.)`,
                                            count: currentBatch,
                                            startNumber: startIdx
                                        });
                                        
                                        remaining -= currentBatch;
                                        subBlockIdx++;
                                    }
                                });
                                
                                return columnBlocks.map((block, bIdx) => (
                                    <div key={bIdx} className="border border-gray-100 p-2 rounded bg-gray-50/50 print:bg-transparent print:border-black min-w-[120px]">
                                        <p className="text-[9px] font-black uppercase mb-2 border-b border-gray-200 pb-1 print:border-black truncate">{block.subject}</p>
                                        <div className="space-y-1.5">
                                            {Array.from({ length: block.count }).map((_, i) => {
                                                const qNum = block.startNumber + i;
                                                return (
                                                    <div key={i} className="flex items-center gap-2 text-[10px]">
                                                        <span className="font-black w-5 text-right">{qNum}.</span>
                                                        <div className="flex gap-1">
                                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                                <div key={opt} className="w-3.5 h-3.5 rounded-full border border-black bg-white flex items-center justify-center text-[7px] font-bold">
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
                    </div>
                    
                    <div className="mt-6 text-[10px] font-bold uppercase text-gray-500 text-center">
                        Mantenha esta área dentro do quadro da câmera para correção automática
                    </div>
                </div>
            )}

            {/* Questions List Grouped by Blocks */}
            <div className={spacing}>
                {(() => {
                    // 1. Group existing questions by block
                    const blocks = [];
                    questions.forEach(q => {
                        const subject = q.subject || (collaborators.find(c => c.userId === q.ownerId)?.subject) || (headerConfig?.subject || "Geral");
                        const blockKey = `${q.ownerId}-${subject}`;
                        
                        let block = blocks.find(b => b.key === blockKey);
                        if (!block) {
                            block = { key: blockKey, ownerId: q.ownerId, subject: subject, questions: [], quota: 0 };
                            blocks.push(block);
                        }
                        block.questions.push(q);
                    });

                    // 2. Add empty blocks for collaborators who haven't added questions yet, or for missing quota
                    collaborators.forEach(collab => {
                        const blockKey = `${collab.userId}-${collab.subject}`;
                        let block = blocks.find(b => b.key === blockKey);
                        if (!block) {
                            block = { key: blockKey, ownerId: collab.userId, subject: collab.subject, questions: [], quota: collab.quota };
                            blocks.push(block);
                        } else {
                            block.quota = collab.quota;
                        }
                    });
                    
                    // 3. Render blocks
                    let globalQuestionIndex = 0;
                    return blocks.map((block, blockIdx) => {
                        const blockTitle = block.subject;
                        const questionsToRender = [...block.questions];
                        const missingCount = Math.max(0, (block.quota || 0) - questionsToRender.length);
                        
                        // Add placeholders for missing questions
                        for (let i = 0; i < missingCount; i++) {
                            questionsToRender.push({ isPlaceholder: true, id: `placeholder-${block.key}-${i}` });
                        }

                        if (questionsToRender.length === 0) return null;

                        return (
                            <div key={block.key || blockIdx} className="space-y-4">
                                <div className="bg-gray-100 py-1 px-4 border-l-4 border-black mb-4 print:bg-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-sm uppercase tracking-widest">
                                        {blockTitle}
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{block.quota || questionsToRender.length} Questões</span>
                                </div>
                                
                                {questionsToRender.map((q, qIdx) => {
                                    const index = globalQuestionIndex++;
                                    const totalExpected = questions.length + (blocks.reduce((acc, b) => acc + Math.max(0, (b.quota || 0) - b.questions.length), 0));
                                    const autoPoints = totalExpected > 0 ? (totalScore / totalExpected) : 0;
                                    const questionPoints = scoringMode === 'auto' ? autoPoints : (Number(q.points) || 0);

                                    if (q.isPlaceholder) {
                                        return (
                                            <div key={q.id} className="break-inside-avoid mb-10 opacity-40">
                                                <div className="flex gap-2">
                                                    <span className="font-bold w-8 shrink-0">{index + 1}.</span>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                        <div className="grid grid-cols-1 gap-2 pl-4">
                                                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-gray-300"></div> <div className="h-2 bg-gray-100 rounded w-1/2"></div></div>
                                                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-gray-300"></div> <div className="h-2 bg-gray-100 rounded w-1/3"></div></div>
                                                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-gray-300"></div> <div className="h-2 bg-gray-100 rounded w-2/3"></div></div>
                                                            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-gray-300"></div> <div className="h-2 bg-gray-100 rounded w-1/4"></div></div>
                                                        </div>
                                                        <p className="text-[10px] font-bold italic text-gray-400">Aguardando questão do professor...</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={q.id || index} className="break-inside-avoid mb-6">
                                            <div className="flex gap-2">
                                                <div className="flex flex-col items-center gap-1 w-8 shrink-0">
                                                    <span className="font-bold">{index + 1}.</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <div className="flex-1">
                                                            <p className={`whitespace-pre-wrap inline ${isAdapted ? 'font-medium' : ''} ${lineHeight}`}>
                                                                {typeof q.text === 'string' ? q.text : String(q.text || "")}
                                                                {q.habilidade && q.habilidade !== "N/A" && printConfig?.showHabilidades !== false && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-vg-light text-vg-hover border border-vg-light text-[9px] font-bold rounded-full uppercase tracking-wider inline-flex items-center align-middle relative -top-0.5 print:border-gray-300 print:text-gray-500 print:bg-transparent">
                                                                        {typeof q.habilidade === 'string' ? q.habilidade : String(q.habilidade)}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap text-gray-500">
                                                            {scoringMode === 'manual' && onQuestionChange ? (
                                                                <div className="print:hidden flex items-center gap-1 bg-vg-light/50 p-1 rounded-lg border border-vg-light">
                                                                    <input
                                                                        type="number"
                                                                        step="0.5"
                                                                        className="w-14 p-1 text-xs border border-vg-navy rounded bg-white outline-none focus:border-vg-dark focus:ring-1 focus:ring-vg-dark text-center font-bold text-vg-hover"
                                                                        value={q.points !== undefined ? q.points : 1}
                                                                        onChange={(e) => onQuestionChange(q.id, { points: e.target.value })}
                                                                    />
                                                                    <span className="text-[10px] uppercase font-bold text-vg-navy">Pts</span>
                                                                </div>
                                                            ) : null}
                                                            {(!onQuestionChange || scoringMode === 'auto') && (
                                                                <span className="font-bold text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600 shadow-sm print:bg-transparent print:border-none print:shadow-none print:text-xs pt-1">
                                                                    {Number.isInteger(questionPoints) ? questionPoints : questionPoints.toFixed(2)} <span className="uppercase font-normal">Pts</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {q.imageUrl && (
                                                        <div className="my-2">
                                                            <img 
                                                                src={q.imageUrl} 
                                                                alt="Questão" 
                                                                className={`object-contain border border-gray-300 rounded-lg bg-gray-50/30 ${q.imageSize === 'small' ? 'max-h-32 w-1/3 mx-auto' : q.imageSize === 'large' ? 'max-h-80 w-full' : 'max-h-56 w-3/4 mx-auto'}`} 
                                                            />
                                                        </div>
                                                    )}

                                                    {q.type === 'multiple_choice' && Array.isArray(q.options) && (
                                                        <div className={`pl-4 ${isAdapted ? 'space-y-3' : 'space-y-1'}`}>
                                                            {q.options.map((opt, i) => {
                                                                const optStr = typeof opt === 'string' ? opt : String(opt || "");
                                                                const cleanOpt = optStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "");
                                                                const correctStr = String(q.correct || "");
                                                                const optionLetter = String.fromCharCode(65 + i); // A, B, C...
                                                                
                                                                // In builder mode (onQuestionChange exists), we always highlight the correct one if showAnswers is true, 
                                                                // but we also show the UI to select it.
                                                                const isCorrectOption = correctStr === optStr || correctStr === cleanOpt || correctStr.toUpperCase() === optionLetter;
                                                                const displayAsCorrect = showAnswers && isCorrectOption;

                                                                return (
                                                                    <div 
                                                                        key={i} 
                                                                        onClick={() => onQuestionChange && onQuestionChange(q.id, { correct: optionLetter })}
                                                                        className={`flex items-start gap-2 p-1.5 rounded transition-colors ${displayAsCorrect ? 'bg-green-100 dark:bg-green-900/30 -ml-1 pl-1.5' : ''} ${onQuestionChange ? 'cursor-pointer hover:bg-gray-100 group' : ''}`}
                                                                    >
                                                                        <span className={`font-medium ${isAdapted ? 'text-lg font-bold' : 'text-sm'} ${displayAsCorrect ? 'text-green-700 font-bold' : ''}`}>({optionLetter.toLowerCase()})</span>
                                                                        <span className={`flex-1 ${isAdapted ? 'text-lg' : ''} ${displayAsCorrect ? 'text-green-700 font-bold' : ''}`}>{cleanOpt}</span>
                                                                        
                                                                        {onQuestionChange && (
                                                                            <span className={`print:hidden text-[10px] uppercase font-bold px-2 py-0.5 rounded transition-opacity ${isCorrectOption ? 'bg-green-600 text-white opacity-100' : 'bg-gray-200 text-gray-500 opacity-0 group-hover:opacity-100'}`}>
                                                                                {isCorrectOption ? 'Correta' : 'Marcar'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {q.type === 'text' && (
                                                        <div className="mt-2 border-t border-b border-gray-300 h-24 w-full">
                                                            <div className="border-b border-gray-200 h-8"></div>
                                                            <div className="border-b border-gray-200 h-8"></div>
                                                            <div className="border-b border-gray-200 h-8"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    });
                })()}
            </div>
            {/* Footer / Copyright */}
            <div className="mt-12 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 font-medium">
                <p>
                    Desenvolvido por <span className="text-vg-dark font-bold">Weslley Nunes - CorrigeLab</span>
                </p>
            </div>
            {/* Print Styles for Page Numbers */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page {
                        margin-top: 2cm;
                        margin-bottom: 2cm;
                    }
                    @page :first {
                        margin-top: 1.2cm;
                    }
                    @page {
                        @bottom-right {
                            content: "Página " counter(page);
                            font-size: 10pt;
                        }
                    }
                    /* Ensure content doesn't stick to top after page breaks */
                    .break-inside-avoid {
                        padding-top: 1rem;
                    }
                }
            `}} />
        </div>
    );
});

ExamPaper.displayName = "ExamPaper";
export default ExamPaper;
