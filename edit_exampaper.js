const fs = require('fs');

let code = fs.readFileSync('src/components/ExamPaper.js', 'utf8');

const target = `{onQuestionDelete && (
                                                                        <button`;
const replacement = `{onQuestionExport && (
                                                                        <button
                                                                            onClick={() => onQuestionExport(q)}
                                                                            className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                                                            title="Exportar Questão"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                                        </button>
                                                                    )}
                                                                    {onQuestionDelete && (
                                                                        <button`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/ExamPaper.js', code, 'utf8');
console.log("ExamPaper updated.");
