const fs = require('fs');

let exampaperCode = fs.readFileSync('src/components/ExamPaper.js', 'utf8');

const uiTarget = `<div className="flex-1">
                                                            <p className={\`whitespace-pre-wrap inline \${isAdapted ? 'font-medium' : ''} \${lineHeight}\`}>`;

const uiReplacement = `<div className="flex-1">
                                                            {q.supportText && (
                                                                <div 
                                                                    className="mb-3 text-[12px] leading-relaxed break-words"
                                                                    dangerouslySetInnerHTML={{ __html: q.supportText }}
                                                                />
                                                            )}
                                                            <p className={\`whitespace-pre-wrap inline \${isAdapted ? 'font-medium' : ''} \${lineHeight}\`}>`;

exampaperCode = exampaperCode.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/components/ExamPaper.js', exampaperCode, 'utf8');
console.log("ExamPaper updated.");
