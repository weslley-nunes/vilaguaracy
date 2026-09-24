const fs = require('fs');

const path = 'src/components/ExamPaper.js';
let code = fs.readFileSync(path, 'utf8');

const startStr = '{/* Bubbles Grid */}';
const endStr = 'FOTOGRAFE ESTA';

const start = code.indexOf(startStr);
const end = code.indexOf(endStr, start);

if (start === -1 || end === -1) {
    console.error("Boundaries not found!");
    process.exit(1);
}

// Find the start of the `<div className="mt-4 text-[10px]` line
const endBoundaryStr = '<div className="mt-4 text-[10px] font-bold uppercase text-gray-500 text-center">';
const endBoundary = code.indexOf(endBoundaryStr, start);

const chunkToReplace = code.substring(start, endBoundary);

const newChunk = `{/* Bubbles Grid */}
                        <div className="w-full flex justify-center gap-x-6">
                            {(() => {
                                const items = [];
                                let globalIdx = 1;
                                
                                const subjectsMap = new Map();
                                multipleChoiceQuestions.forEach(q => {
                                    const sub = q.subject || "Geral";
                                    subjectsMap.set(sub, (subjectsMap.get(sub) || 0) + 1);
                                });
                                
                                subjectsMap.forEach((quota, subject) => {
                                    items.push({ type: 'header', text: subject });
                                    for (let i = 0; i < quota; i++) {
                                        items.push({ type: 'question', qNum: globalIdx++ });
                                    }
                                });
                                
                                const col1 = [];
                                const col2 = [];
                                
                                let splitIdx = Math.ceil(items.length / 2);
                                if (splitIdx < items.length && items[splitIdx - 1]?.type === 'header') {
                                    splitIdx--;
                                }
                                
                                for (let i = 0; i < items.length; i++) {
                                    if (i < splitIdx) col1.push(items[i]);
                                    else col2.push(items[i]);
                                }
                                
                                const renderColumn = (colItems, bIdx) => (
                                    <div key={bIdx} className="w-[160px] border-t-2 border-black pt-1 flex flex-col gap-y-3">
                                        {colItems.map((item, idx) => {
                                            if (item.type === 'header') {
                                                return <p key={\`h-\${idx}\`} className={\`font-black uppercase text-center truncate \${isAdapted ? 'text-[14px]' : 'text-[9px]'} \${idx > 0 ? 'mt-2' : ''}\`}>{item.text}</p>;
                                            } else {
                                                return (
                                                    <div key={\`q-\${item.qNum}\`} className={\`flex items-center justify-between \${isAdapted ? 'text-[16px]' : 'text-[11px]'}\`}>
                                                        <span className={\`font-black text-right pr-2 \${isAdapted ? 'w-8' : 'w-6'}\`}>{item.qNum}.</span>
                                                        <div className="flex gap-2">
                                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                                <div key={opt} className={\`rounded-full border-[1.5px] border-black bg-white flex items-center justify-center font-bold \${isAdapted ? 'w-8 h-8 text-[14px]' : 'w-5 h-5 text-[10px]'}\`}>
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                );
                                
                                return (
                                    <>
                                        {renderColumn(col1, 1)}
                                        {col2.length > 0 && renderColumn(col2, 2)}
                                    </>
                                );
                            })()}
                        </div>
                        `;

code = code.substring(0, start) + newChunk + code.substring(endBoundary);

fs.writeFileSync(path, code, 'utf8');
console.log("Replaced successfully!");
