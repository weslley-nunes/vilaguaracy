import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const ExamPaper = forwardRef(({ questions, title, headerConfig, showAnswers = false, isAdapted = false }, ref) => {
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
                    <div className="w-full h-40 overflow-hidden flex items-center justify-center border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={headerConfig.customHeaderImageUrl} alt="Cabeçalho Personalizado" className="w-full h-full object-cover" />
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
            {/* Logic: Always show unless it's a "Teacher Key" view where we might just want to see answers inline. 
                But user asked for integrated sheet. So we show it. 
            */}
            {multipleChoiceQuestions.length > 0 && (
                <div className="mb-8 border-2 border-dashed border-gray-400 p-4 rounded-lg bg-gray-50 print:bg-transparent print:border-black">
                    <p className="text-center text-xs font-bold uppercase mb-2">Cartão Resposta - Preencha completamente a bolinha</p>
                    <div className="flex gap-4">
                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center border-r border-gray-300 pr-4">
                            <QRCodeSVG
                                value={JSON.stringify({
                                    id: examId,
                                    s: studentName,
                                    // Key logic: We might want encoded answers here for offline grading, 
                                    // but keep it simple for now (ID lookup) to avoid huge QR codes
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
                                        // Find exact index in original array
                                        const realIndex = questions.indexOf(q) + 1;
                                        return (
                                            <div key={q.id || qIdx} className="flex items-center gap-1 text-xs">
                                                <span className="font-bold w-5 text-right mr-1">{realIndex}.</span>
                                                {[0, 1, 2, 3, 4].map((optIdx) => {
                                                    // Highlighting logic for Teacher View in the grid? Maybe not necessary, usually inline is better.
                                                    // But let's keep the grid standard.
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
                {questions.map((q, index) => (
                    <div key={q.id || index} className="break-inside-avoid">
                        <div className="flex gap-2">
                            <span className="font-bold">{index + 1}.</span>
                            <div className="flex-1">
                                <p className={`mb-2 whitespace-pre-wrap ${isAdapted ? 'font-medium' : ''} ${lineHeight}`}>{q.text}</p>
                                {q.imageUrl && (
                                    <div className="my-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={q.imageUrl} alt="Questão" className="max-h-40 object-contain border rounded-lg" />
                                    </div>
                                )}

                                {q.type === 'multiple_choice' && (
                                    <div className={`pl-4 ${isAdapted ? 'space-y-3' : 'space-y-1'}`}>
                                        {q.options?.map((opt, i) => {
                                            const cleanOpt = opt.replace(/^[a-zA-Z\d]+[).:-]\s*/, "");
                                            const isCorrect = showAnswers && (
                                                q.correct === opt ||
                                                q.correct === cleanOpt ||
                                                // Try to match index if correct is a letter
                                                q.correct?.toLowerCase() === String.fromCharCode(97 + i)
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
                ))}
            </div>
        </div>
    );
});

ExamPaper.displayName = "ExamPaper";
export default ExamPaper;
