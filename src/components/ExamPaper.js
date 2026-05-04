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
            <div className="border-b-2 border-black pb-4 mb-4">
                {headerConfig?.useCustomHeader && headerConfig?.customHeaderImageUrl ? (
                    <div className="w-full flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={headerConfig.customHeaderImageUrl} alt="Cabeçalho Personalizado" className="w-full h-auto object-contain" />
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4 gap-4">
                            <div className="flex-1">
                                <h1 className="text-xl font-bold uppercase">{headerConfig?.schoolName || "Nome da Escola"}</h1>
                            </div>
                            {headerConfig?.logoUrl ? (
                                <div className="w-24 h-24 flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={headerConfig.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                </div>
                            ) : (
                                <div className="border border-black p-2 text-sm w-32 h-24 flex items-center justify-center text-center text-gray-400">
                                    Logotipo
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-300 pt-2">
                            <p><span className="font-bold">Professor(a):</span> {headerConfig?.teacherName}</p>
                            {headerConfig?.showDate && <p><span className="font-bold">Data:</span> ____/____/______</p>}
                            <p><span className="font-bold">Aluno(a):</span> {studentName || "_________________________________________________"}</p>
                            <p><span className="font-bold">Turma:</span> {headerConfig?.className || "________"}</p>
                        </div>
                        <div className="mt-4 text-center">
                            <h2 className={`${titleSize} font-bold uppercase`}>{title || "Avaliação"} {isAdapted && <span className="text-sm block normal-case mt-1">(Prova Adaptada - Fonte Ampliada)</span>}</h2>
                        </div>
                    </>
                )}
            </div>

            {/* Configurable Instructions Section */}
            {headerConfig?.instructions && (
                <div className="mb-6 border border-gray-300 p-4 rounded-lg bg-gray-50 print:bg-transparent print:border-black">
                    <h3 className="font-bold text-[12px] uppercase mb-1">Orientações:</h3>
                    <p className={`whitespace-pre-wrap text-[11px] ${isAdapted ? 'text-lg' : ''} leading-relaxed font-medium text-gray-800`}>
                        {headerConfig.instructions}
                    </p>
                </div>
            )}

            {/* INTEGRATED ANSWER SHEET - Standardized Square for Precise Capture */}
            {multipleChoiceQuestions.length > 0 && (
                <div className="mb-12 border-2 border-black p-8 rounded-xl bg-gray-50 print:bg-transparent print:border-black relative aspect-square w-full max-w-[650px] mx-auto flex flex-col items-center justify-center">
                    {/* High-Precision Alignment Markers */}
                    <div className="absolute top-0 left-0 w-4 h-4 bg-black print:block"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 bg-black print:block"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 bg-black print:block"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-black print:block"></div>

                    <p className="text-center text-sm font-bold uppercase mb-6 tracking-widest border-b border-black pb-2 w-full">Folha de Respostas Oficial</p>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start justify-between w-full px-2 md:px-6">
                        {/* QR Code Section */}
                        <div className="flex flex-col items-center justify-center p-4 border-2 border-black rounded-lg bg-white">
                            <QRCodeSVG
                                value={JSON.stringify({
                                    id: examId,
                                    s: studentName,
                                    ac: headerConfig?.accessCode || "",
                                    ...(headerConfig?.classId && { c: headerConfig.classId })
                                })}
                                size={120}
                                level="H"
                            />
                            <div className="mt-2 flex flex-col items-center">
                                <span className="text-[12px] font-bold font-mono">ID: {examId.slice(-6)}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-600 mt-1">{studentName.slice(0, 20)}</span>
                            </div>
                        </div>

                        {/* Bubbles Grid Section */}
                        <div className="flex gap-6 justify-center items-start p-4 bg-white border-2 border-black rounded-lg">
                            {gridColumns.map((col, colIdx) => (
                                <div key={colIdx} className="space-y-2">
                                    <div className="flex gap-2 pl-8 mb-1 text-[12px] font-black">
                                        <span className="w-4 text-center">A</span>
                                        <span className="w-4 text-center">B</span>
                                        <span className="w-4 text-center">C</span>
                                        <span className="w-4 text-center">D</span>
                                        <span className="w-4 text-center">E</span>
                                    </div>
                                    {col.map((q, qIdx) => {
                                        const realIndex = questions.indexOf(q) + 1;
                                        return (
                                            <div key={q.id || qIdx} className="flex items-center gap-2 text-sm">
                                                <span className="font-black w-6 text-right mr-2">{realIndex}.</span>
                                                {[0, 1, 2, 3, 4].map((optIdx) => {
                                                    return (
                                                        <div key={optIdx} className="w-4 h-4 rounded-full border-2 border-black bg-white"></div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
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
                    // 1. Group questions by block (owner + subject combination)
                    const blocks = [];
                    questions.forEach(q => {
                        const subject = q.subject || (collaborators.find(c => c.userId === q.ownerId)?.subject) || (headerConfig?.subject || "Geral");
                        const blockKey = `${q.ownerId}-${subject}`;
                        
                        let block = blocks.find(b => b.key === blockKey);
                        if (!block) {
                            block = { key: blockKey, ownerId: q.ownerId, subject: subject, questions: [] };
                            blocks.push(block);
                        }
                        block.questions.push(q);
                    });
                    
                    // 2. Render each block
                    return blocks.map((block, blockIdx) => {
                        const blockTitle = block.subject;

                        return (
                            <div key={block.key || blockIdx} className="space-y-4">
                                {(blocks.length > 1 || collaborators.length > 0) && (
                                    <div className="bg-gray-100 py-1 px-4 border-l-4 border-black mb-4 print:bg-gray-50">
                                        <h3 className="font-bold text-sm uppercase tracking-widest">
                                            Bloco: {blockTitle}
                                        </h3>
                                    </div>
                                )}
                                
                                {block.questions.map((q, qIdx) => {
                                    const index = questions.indexOf(q);
                                    const autoPoints = questions.length > 0 ? (totalScore / questions.length) : 0;
                                    const questionPoints = scoringMode === 'auto' ? autoPoints : (Number(q.points) || 0);

                                    return (
                                        <div key={q.id || index} className="break-inside-avoid mb-6">
                                            {/* Question Render Logic (Simplified for this replacement, but keep the full logic) */}
                                            <div className="flex gap-2">
                                                <div className="flex flex-col items-center gap-1 w-8 shrink-0">
                                                    <span className="font-bold">{index + 1}.</span>
                                                </div>
                                                <div className="flex-1">
                                                    {/* ... full question content ... */}
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
                                                    
                                                    {q.imageUrl && <div className="my-2"><img src={q.imageUrl} alt="Questão" className="max-h-40 object-contain border rounded-lg" /></div>}

                                                    {q.type === 'multiple_choice' && Array.isArray(q.options) && (
                                                        <div className={`pl-4 ${isAdapted ? 'space-y-3' : 'space-y-1'}`}>
                                                            {q.options.map((opt, i) => {
                                                                const optStr = typeof opt === 'string' ? opt : String(opt || "");
                                                                const cleanOpt = optStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "");
                                                                const correctStr = String(q.correct || "");
                                                                const isCorrect = showAnswers && (correctStr === optStr || correctStr === cleanOpt || correctStr.toLowerCase() === String.fromCharCode(97 + i));
                                                                return (
                                                                    <div key={i} className={`flex items-start gap-2 p-1 rounded ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 -ml-1 pl-1' : ''}`}>
                                                                        <span className={`font-medium ${isAdapted ? 'text-lg font-bold' : 'text-sm'} ${isCorrect ? 'text-green-700 font-bold' : ''}`}>({String.fromCharCode(97 + i)})</span>
                                                                        <span className={`${isAdapted ? 'text-lg' : ''} ${isCorrect ? 'text-green-700 font-bold' : ''}`}>{cleanOpt}</span>
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
                    Desenvolvido por <a href="https://vilaguaracy.com.br" target="_blank" rel="noopener noreferrer" className="text-vg-dark font-bold hover:underline">Vila Guaracy</a> - Realize sua avaliação também acessando: <span className="font-mono">vilaguaracy.com.br</span>
                </p>
            </div>
        </div>
    );
});

ExamPaper.displayName = "ExamPaper";
export default ExamPaper;
