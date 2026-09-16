import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const renderFormattedText = (text) => {
    if (typeof text !== 'string') return String(text || "");
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const ExamPaper = forwardRef(({ questions, title, collaborators = [], headerConfig, showAnswers = false, isAdapted = false, scoringMode = "auto", totalScore = 3, onQuestionChange = null, onQuestionEdit = null, onQuestionDelete = null, onQuestionExport = null, printConfig = {} }, ref) => {
    // Determine exam ID for QR (fallback to timestamp if not provided in headerConfig)
    const examId = headerConfig?.examId || "PREVIEW";
    const studentName = headerConfig?.studentName || "";

    // Extract class from title if className is empty or generic
    let displayClassName = headerConfig?.className;
    if (!displayClassName || displayClassName.trim() === "" || displayClassName.trim() === "82.____") {
        // Try to match "Turma [Nome da Turma]"
        const turmaMatch = title?.match(/turma\s+([^–\-—]+)/i);
        if (turmaMatch) {
            displayClassName = turmaMatch[1].trim();
        } else {
            // Try to match standard XX.XX pattern (e.g., 92.01)
            const patternMatch = title?.match(/\b\d{2}\.\d{2}\b/);
            if (patternMatch) {
                displayClassName = patternMatch[0];
            }
        }
    }
    const finalClassName = displayClassName || "82.____";

    // Accessibility Styles
    const fontStyle = isAdapted ? { fontFamily: 'Verdana, sans-serif' } : { fontFamily: 'Times New Roman, serif' };
    const baseTextSize = isAdapted ? 'text-[22px]' : 'text-base';
    const titleSize = isAdapted ? 'text-3xl' : 'text-2xl';
    const spacing = isAdapted ? 'space-y-8' : 'space-y-6';
    const lineHeight = isAdapted ? 'leading-relaxed' : '';


    



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

    // 3. Sort blocks by subject order
    const subjectOrder = [
        "Arte",
        "Educação Física",
        "Língua Inglesa",
        "Inglês",
        "Língua Portuguesa",
        "História",
        "Geografia",
        "Ciências",
        "Matemática"
    ];
    
    const getSubjectIndex = (subjectName) => {
        if (!subjectName) return 999;
        const lowerName = subjectName.toLowerCase().trim();
        for (let i = 0; i < subjectOrder.length; i++) {
            const ord = subjectOrder[i].toLowerCase();
            if (lowerName === ord || lowerName.includes(ord) || ord.includes(lowerName)) {
                return i;
            }
        }
        return 999;
    };
    
    blocks.sort((a, b) => getSubjectIndex(a.subject) - getSubjectIndex(b.subject));

    // 4. Flatten blocks into a single list of questions (including placeholders)
    const flatQuestions = [];
    blocks.forEach(block => {
        const questionsInBlock = [...block.questions];
        const missingCount = Math.max(0, (block.quota || 0) - questionsInBlock.length);
        
        // Add actual questions
        questionsInBlock.forEach(q => {
            flatQuestions.push({
                ...q,
                subject: q.subject || block.subject,
                blockSubject: block.subject,
                blockOwnerId: block.ownerId
            });
        });
        
        // Add placeholders
        for (let i = 0; i < missingCount; i++) {
            flatQuestions.push({
                isPlaceholder: true,
                id: `placeholder-${block.key}-${i}`,
                subject: block.subject,
                blockSubject: block.subject,
                blockOwnerId: block.ownerId,
                type: 'multiple_choice' // Default to MC for bubble count
            });
        }
    });

    // Group questions for Answer Grid (2 cols max in grid to avoid overflow)
    const multipleChoiceQuestions = flatQuestions.filter(q => q.type === 'multiple_choice' || q.isPlaceholder);
    const questionsPerCol = Math.ceil(multipleChoiceQuestions.length / 2) || 5;
    const gridColumns = [];
    if (multipleChoiceQuestions.length > 0) {
        for (let i = 0; i < multipleChoiceQuestions.length; i += questionsPerCol) {
            gridColumns.push(multipleChoiceQuestions.slice(i, i + questionsPerCol));
        }
    }

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
        if (allText.includes(`**${verb}**`) || allText.match(new RegExp(`\\b${verb}\\b`))) {
            usedVerbs.add(verb);
        }
    });
    const usedVerbsList = Array.from(usedVerbs).sort();

    return (
        <div ref={ref} className={`bg-white p-12 shadow-lg min-h-[1123px] w-[794px] mx-auto text-black print:shadow-none print:w-full relative ${isAdapted ? 'text-[22px]' : ''}`} style={fontStyle}>

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
                                <p>{headerConfig?.bimester || "2º Bimestre"}</p>
                                <p>Turma: {finalClassName}</p>
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

            {/* Split Section: Instructions, Tabelinha & Answer Sheet */}
            <div className="flex flex-row items-stretch gap-6 mb-6 w-full">
                {/* Left Column: Instructions & Tabelinha */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Instructions */}
                    <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 print:bg-transparent print:border-black">
                        <h3 className="font-bold text-[12px] uppercase mb-2">📝 Orientações Importantes:</h3>
                        <p className={`text-[11px] ${isAdapted ? 'text-[18px]' : ''} font-medium text-gray-800 leading-snug`}>
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
                            <table className={`w-full border-collapse border border-black ${isAdapted ? 'text-[12px] border-2' : 'text-[10px]'} text-left print:border-black`}>
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
                                    {headerConfig?.accessCode ? `ALUNO: ${headerConfig.accessCode}` : (studentName.slice(0, 25) || "_____________________")}
                                </span>
                            </div>
                            <div className="shrink-0 flex flex-col items-center bg-gray-50 border border-gray-200 p-1.5 rounded-lg print:border-black">
                                <QRCodeSVG
                                    value={`${typeof window !== 'undefined' ? window.location.origin : 'https://vilaguaracy.com.br'}/scanner?id=${examId}&s=${encodeURIComponent(studentName)}&ac=${encodeURIComponent(headerConfig?.accessCode || "")}${headerConfig?.classId ? `&c=${encodeURIComponent(headerConfig.classId)}` : ''}`}
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
                                            subject: subBlockIdx === 0 ? subject : `${subject} (cont.)`,
                                            count: currentBatch,
                                            startNumber: startIdx
                                        });
                                        
                                        remaining -= currentBatch;
                                        subBlockIdx++;
                                    }
                                });
                                
                                return columnBlocks.map((block, bIdx) => (
                                    <div key={bIdx} className="w-[155px] border-t-2 border-black pt-1">
                                        <p className={`font-black uppercase mb-3 text-center truncate ${isAdapted ? 'text-[14px]' : 'text-[9px]'}`}>{block.subject}</p>
                                        <div className="space-y-3">
                                            {Array.from({ length: block.count }).map((_, i) => {
                                                const qNum = block.startNumber + i;
                                                return (
                                                    <div key={i} className={`flex items-center justify-between ${isAdapted ? 'text-[16px]' : 'text-[11px]'}`}>
                                                        <span className={`font-black text-right pr-2 ${isAdapted ? 'w-8' : 'w-6'}`}>{qNum}.</span>
                                                        <div className="flex gap-2">
                                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                                <div key={opt} className={`rounded-full border-[1.5px] border-black bg-white flex items-center justify-center font-bold ${isAdapted ? 'w-8 h-8 text-[14px]' : 'w-5 h-5 text-[10px]'}`}>
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

            {/* Questions List Grouped by Blocks */}
            <div className={spacing}>
                {(() => {
                    let globalQuestionIndex = 0;
                    return blocks.map((block, blockIdx) => {
                        const blockTitle = block.subject;
                        const questionsToRender = [...block.questions];
                        const missingCount = Math.max(0, (block.quota || 0) - questionsToRender.length);
                        
                        // Add placeholders for missing questions
                        for (let i = 0; i < missingCount; i++) {
                            questionsToRender.push({
                                isPlaceholder: true,
                                id: `placeholder-${block.key}-${i}`,
                                subject: block.subject,
                                blockSubject: block.subject,
                                blockOwnerId: block.ownerId,
                                type: 'multiple_choice'
                            });
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
                                    const totalExpected = flatQuestions.length;
                                    const autoPoints = totalExpected > 0 ? (totalScore / totalExpected) : 0;
                                    const questionPoints = scoringMode === 'auto' ? autoPoints : (Number(q.points) || 0);

                                    if (q.isPlaceholder) {
                                        return (
                                            <div key={q.id} className="break-inside-avoid mb-10 opacity-40">
                                                <div className="flex gap-2">
                                                    <span className={`font-bold ${isAdapted ? 'w-14' : 'w-8'} shrink-0`}>{index + 1}.</span>
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
                                                <div className={`flex flex-col items-center gap-1 ${isAdapted ? 'w-14' : 'w-8'} shrink-0`}>
                                                    <span className="font-bold">{index + 1}.</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <div className="flex-1">
                                                            {q.supportText && (
                                                                <div 
                                                                    className="mb-3 text-[12px] leading-relaxed break-words"
                                                                    dangerouslySetInnerHTML={{ __html: q.supportText }}
                                                                />
                                                            )}
                                                            <p className={`whitespace-pre-wrap inline ${isAdapted ? 'font-medium' : ''} ${lineHeight}`}>
                                                                {renderFormattedText(q.text)}
                                                                {q.habilidade && q.habilidade !== "N/A" && printConfig?.showHabilidades !== false && (
                                                                    <span className="ml-2 px-2 py-0.5 bg-vg-light text-vg-hover border border-vg-light text-[9px] font-bold rounded-full uppercase tracking-wider inline-flex items-center align-middle relative -top-0.5 print:border-gray-300 print:text-gray-500 print:bg-transparent">
                                                                        {typeof q.habilidade === 'string' ? q.habilidade : String(q.habilidade)}
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap text-gray-500">
                                                            {/* Action buttons (only in builder) */}
                                                            {onQuestionChange && (
                                                                <div className="print:hidden flex items-center gap-1 mr-1">
                                                                    {onQuestionEdit && (
                                                                        <button
                                                                            onClick={() => onQuestionEdit(q)}
                                                                            className="p-1 rounded text-gray-400 hover:text-vg-dark hover:bg-gray-100 transition-colors"
                                                                            title="Editar Questão"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                                                        </button>
                                                                    )}
                                                                    {onQuestionExport && (
                                                                        <button
                                                                            onClick={() => onQuestionExport(q)}
                                                                            className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                                            title="Exportar Questão"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                                        </button>
                                                                    )}
                                                                    {onQuestionDelete && (
                                                                        <button
                                                                            onClick={() => onQuestionDelete(q.id)}
                                                                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                            title="Excluir Questão"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}

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
                                                                        <span className={`font-medium ${isAdapted ? 'text-[22px] font-bold' : 'text-sm'} ${displayAsCorrect ? 'text-green-700 font-bold' : ''}`}>({optionLetter.toLowerCase()})</span>
                                                                        <span className={`flex-1 ${isAdapted ? 'text-[22px]' : ''} ${displayAsCorrect ? 'text-green-700 font-bold' : ''}`}>{cleanOpt}</span>
                                                                        
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
                        margin-top: 1cm;
                        margin-bottom: 1cm;
                    }
                    @page :first {
                        margin-top: 1cm;
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
