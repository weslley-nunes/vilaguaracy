import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const ExamPaper = forwardRef(({ questions, title, headerConfig, showAnswers = false, isAdapted = false, scoringMode = "auto", totalScore = 10, onQuestionChange = null, printConfig = {} }, ref) => {
    // Determine exam ID for QR (fallback to timestamp if not provided in headerConfig)
    const examId = headerConfig?.examId || "PREVIEW";
    const studentName = headerConfig?.studentName || "";

    // Accessibility Styles
    const fontStyle = isAdapted ? { fontFamily: 'Verdana, sans-serif' } : { fontFamily: 'Times New Roman, serif' };
    const baseTextSize = isAdapted ? 'text-lg' : 'text-base';
    const titleSize = isAdapted ? 'text-3xl' : 'text-2xl';
    const spacing = isAdapted ? 'space-y-8' : 'space-y-6';
    const lineHeight = isAdapted ? 'leading-relaxed' : '';


    // Group questions for Answer Grid (5 cols max in grid)
    const multipleChoiceQuestions = questions.filter(q => q.type === 'multiple_choice');
    const questionsPerCol = Math.ceil(multipleChoiceQuestions.length / 4) || 5;
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

            {/* INTEGRATED ANSWER SHEET (ONLY IF NOT TEACHER VIEW OR EXPLICITLY ENABLED) */}
            {multipleChoiceQuestions.length > 0 && (
                <div className="mb-8 border-2 border-dashed border-gray-400 p-4 rounded-lg bg-gray-50 print:bg-transparent print:border-black relative">
                    {/* Aligment Markers for Mobile App */}
                    <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-black print:block hidden"></div>
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-black print:block hidden"></div>
                    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-black print:block hidden"></div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-black print:block hidden"></div>

                    <p className="text-center text-xs font-bold uppercase mb-2">Cartão Resposta - Preencha completamente a bolinha</p>
                    <div className="flex gap-4">
                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center border-r border-gray-300 pr-4">
                            <QRCodeSVG
                                value={JSON.stringify({
                                    id: examId,
                                    s: studentName,
                                    ...(headerConfig?.classId && { c: headerConfig.classId })
                                })}
                                size={100}
                            />
                            <span className="text-[10px] font-mono mt-1">{examId.slice(-6)}</span>
                        </div>

                        {/* Bubbles Grid */}
                        <div className="flex-1 flex gap-6 justify-center">
                            {gridColumns.map((col, colIdx) => (
                                <div key={colIdx} className="space-y-1">
                                    <div className="flex gap-1 pl-6 mb-1 text-[10px] font-bold">
                                        <span className="w-3 text-center">A</span>
                                        <span className="w-3 text-center">B</span>
                                        <span className="w-3 text-center">C</span>
                                        <span className="w-3 text-center">D</span>
                                        <span className="w-3 text-center">E</span>
                                    </div>
                                    {col.map((q, qIdx) => {
                                        const realIndex = questions.indexOf(q) + 1;
                                        return (
                                            <div key={q.id || qIdx} className="flex items-center gap-1 text-xs">
                                                <span className="font-bold w-5 text-right mr-1">{realIndex}.</span>
                                                {[0, 1, 2, 3, 4].map((optIdx) => {
                                                    return (
                                                        <div key={optIdx} className="w-3 h-3 rounded-full border border-black"></div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Questions List */}
            <div className={spacing}>
                {questions.map((q, index) => {
                    const autoPoints = questions.length > 0 ? (totalScore / questions.length) : 0;
                    const questionPoints = scoringMode === 'auto' ? autoPoints : (Number(q.points) || 0);

                    return (
                        <div key={q.id || index} className="break-inside-avoid">
                            <div className="flex gap-2">
                                <div className="flex flex-col items-center gap-1 w-8 shrink-0">
                                    <span className="font-bold">{index + 1}.</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start gap-4 mb-2">
                                        <div className="flex-1">
                                            <p className={`whitespace-pre-wrap inline ${isAdapted ? 'font-medium' : ''} ${lineHeight}`}>
                                                {typeof q.text === 'string' ? q.text : String(q.text || "")}
                                                {q.bncc && q.bncc !== "N/A" && printConfig?.showBNCC !== false && (
                                                    <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold rounded-full uppercase tracking-wider inline-flex items-center align-middle relative -top-0.5 print:border-gray-300 print:text-gray-500 print:bg-transparent">
                                                        {typeof q.bncc === 'string' ? q.bncc : String(q.bncc)}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Pontuação da Questão */}
                                        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap text-gray-500">
                                            {scoringMode === 'manual' && onQuestionChange ? (
                                                <div className="print:hidden flex items-center gap-1 bg-indigo-50/50 p-1 rounded-lg border border-indigo-100">
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        className="w-14 p-1 text-xs border border-indigo-300 rounded bg-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-center font-bold text-indigo-700"
                                                        value={q.points !== undefined ? q.points : 1}
                                                        onChange={(e) => onQuestionChange(q.id, { points: e.target.value })}
                                                        title="Valor desta questão"
                                                    />
                                                    <span className="text-[10px] uppercase font-bold text-indigo-400">Pts</span>
                                                </div>
                                            ) : null}

                                            {/* Display Points (Print View or Auto Mode) */}
                                            {(!onQuestionChange || scoringMode === 'auto') && (
                                                <span className="font-bold text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600 shadow-sm print:bg-transparent print:border-none print:shadow-none print:text-xs pt-1">
                                                    {Number.isInteger(questionPoints) ? questionPoints : questionPoints.toFixed(1)} <span className="uppercase font-normal">Pts</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {q.imageUrl && (
                                        <div className="my-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={q.imageUrl} alt="Questão" className="max-h-40 object-contain border rounded-lg" />
                                        </div>
                                    )}

                                    {q.type === 'multiple_choice' && Array.isArray(q.options) && (
                                        <div className={`pl-4 ${isAdapted ? 'space-y-3' : 'space-y-1'}`}>
                                            {q.options.map((opt, i) => {
                                                const optStr = typeof opt === 'string' ? opt : String(opt || "");
                                                const cleanOpt = optStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "");
                                                const correctStr = String(q.correct || "");

                                                const isCorrect = showAnswers && (
                                                    correctStr === optStr ||
                                                    correctStr === cleanOpt ||
                                                    // Try to match index if correct is a letter
                                                    correctStr.toLowerCase() === String.fromCharCode(97 + i)
                                                );

                                                return (
                                                    <div key={i} className={`flex items-start gap-2 p-1 rounded ${isCorrect ? 'bg-green-100 dark:bg-green-900/30 -ml-1 pl-1' : ''}`}>
                                                        <span className={`font-medium ${isAdapted ? 'text-lg font-bold' : 'text-sm'} ${isCorrect ? 'text-green-700 font-bold' : ''}`}>({String.fromCharCode(97 + i)})</span>
                                                        <span className={`${isAdapted ? 'text-lg' : ''} ${isCorrect ? 'text-green-700 font-bold' : ''}`}>{cleanOpt}</span>
                                                        {isCorrect && <span className="text-green-600 text-xs ml-2 font-bold">✔ Correta</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {q.type === 'text' && (
                                        <div className="mt-2 border-t border-b border-gray-300 h-24 w-full">
                                            {/* Linhas para resposta */}
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
            {/* Footer / Copyright */}
            <div className="mt-12 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 font-medium">
                <p>
                    Desenvolvido por <a href="https://corrigelab.com.br" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">corrigelab</a> - Realize sua avaliação também acessando: <span className="font-mono">corrigelab.com.br</span>
                </p>
            </div>
        </div>
    );
});

ExamPaper.displayName = "ExamPaper";
export default ExamPaper;
