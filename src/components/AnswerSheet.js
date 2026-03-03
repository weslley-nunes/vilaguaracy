import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AnswerSheet = forwardRef(({ examTitle, studentName, examId, questions, date }, ref) => {
    // Generate valid ID for footer
    const displayId = examId || "PREVIEW-000";

    // Group questions into columns (e.g., 20 per column)
    const questionsPerCol = 20;
    const columns = [];
    for (let i = 0; i < questions.length; i += questionsPerCol) {
        columns.push(questions.slice(i, i + questionsPerCol));
    }

    return (
        <div ref={ref} className="bg-white p-8 w-[794px] min-h-[500px] mx-auto text-black border-2 border-black relative print:w-full print:border-0" style={{ fontFamily: 'Times New Roman, serif' }}>

            {/* Header Box */}
            <div className="border-2 border-black mb-4">
                <div className="border-b border-black p-2 text-center font-bold text-sm">
                    Marque o gabarito preenchendo completamente a região de cada alternativa.
                </div>
                <div className="flex">
                    {/* QR Code Section */}
                    <div className="w-1/3 p-4 border-r border-black flex flex-col items-center justify-center">
                        <QRCodeSVG value={JSON.stringify({ id: displayId, s: studentName || 'Anon' })} size={150} level="M" />
                    </div>

                    {/* Student Info & Grid Section */}
                    <div className="w-2/3 p-4">
                        {/* Student Info */}
                        <div className="mb-6 text-sm space-y-1">
                            <p><span className="font-bold">Aluno(a):</span> {studentName || "________________________________________________"}</p>
                            <div className="flex justify-between">
                                <p><span className="font-bold">Prova:</span> {examTitle}</p>
                                <p><span className="font-bold">Data:</span> {date || "___/___/___"}</p>
                            </div>
                        </div>

                        {/* Answer Grid */}
                        <div className="flex gap-8">
                            {columns.map((colQuestions, colIndex) => (
                                <div key={colIndex} className="flex-1">
                                    <div className="flex justify-end gap-3 mb-1 pr-1 font-bold text-xs font-mono">
                                        <span>a</span><span>b</span><span>c</span><span>d</span><span>e</span>
                                    </div>
                                    {colQuestions.map((q, idx) => {
                                        const originalIdx = colIndex * questionsPerCol + idx;
                                        return (
                                            <div key={originalIdx} className="flex items-center justify-between mb-1 text-sm">
                                                <span className="font-bold mr-2 w-6 text-right">Q.{originalIdx + 1}:</span>
                                                {q.type === 'multiple_choice' ? (
                                                    <div className="flex gap-1.5">
                                                        {[0, 1, 2, 3, 4].map((optIdx) => (
                                                            <div
                                                                key={optIdx}
                                                                className="w-4 h-3 rounded-[40%] border border-black border-dotted"
                                                            ></div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs italic text-right flex-1 bg-gray-100 px-2 rounded">
                                                        Discursiva
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Corner Markers (Decorative/Alignment) */}
                        <div className="absolute top-2 right-2 w-4 h-4 bg-black"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 bg-black"></div>
                    </div>
                </div>
            </div>

            {/* Footer ID */}
            <div className="text-center border-t border-black pt-2 font-mono text-lg">
                Prova: {displayId}
            </div>

            <div className="mt-8 text-center text-xs text-gray-500">
                Verifique as respostas em: <span className="underline text-blue-600">corrigelab.com/check?id={displayId}</span>
            </div>
        </div>
    );
});

AnswerSheet.displayName = "AnswerSheet";
export default AnswerSheet;
