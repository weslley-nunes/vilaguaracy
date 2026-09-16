const fs = require('fs');

let code = fs.readFileSync('src/app/(dashboard)/builder/page.js', 'utf8');

// 1. Add States
const stateTarget = `const [selectedTemplate, setSelectedTemplate] = useState("");`;
const stateReplacement = `const [selectedTemplate, setSelectedTemplate] = useState("");
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportQuestionTarget, setExportQuestionTarget] = useState(null);
    const [exportTargetExams, setExportTargetExams] = useState([]);
    const [selectedTargetExam, setSelectedTargetExam] = useState("");
    const [isExporting, setIsExporting] = useState(false);`;
code = code.replace(stateTarget, stateReplacement);

// 2. Add functions
const funcTarget = `const removeQuestion = (id) => {`;
const funcReplacement = `const openExportModal = async (question) => {
        setExportQuestionTarget(question);
        setIsExportModalOpen(true);
        if (user) {
            const myExams = await ExamService.listByTeacher(user.uid);
            setExportTargetExams(myExams.filter(e => e.id !== examId));
        }
    };

    const handleExportQuestion = async () => {
        if (!selectedTargetExam) return;
        setIsExporting(true);
        try {
            const targetExam = await ExamService.getById(selectedTargetExam);
            if (targetExam) {
                const newQuestion = { ...exportQuestionTarget, id: Date.now() + Math.random(), ownerId: user.uid };
                const updatedQuestions = [...(targetExam.questions || []), newQuestion];
                
                const { doc, updateDoc } = await import('firebase/firestore');
                const docRef = doc(db, "exams", targetExam.id);
                await updateDoc(docRef, { questions: updatedQuestions });
                
                alert("Questão exportada com sucesso!");
                setIsExportModalOpen(false);
                setSelectedTargetExam("");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao exportar questão.");
        } finally {
            setIsExporting(false);
        }
    };

    const removeQuestion = (id) => {`;
code = code.replace(funcTarget, funcReplacement);

// 3. Add props to ExamPaper
const propTarget1 = `onQuestionDelete={removeQuestion}`;
const propReplacement1 = `onQuestionDelete={removeQuestion}
                            onQuestionExport={openExportModal}`;
// Since there's multiple, let's just replace all occurrences of `onQuestionDelete={removeQuestion}`
code = code.replace(/onQuestionDelete={removeQuestion}/g, propReplacement1);

// 4. Add Export Modal JSX
const modalTarget = `{/* --- Collaborators Modal --- */}`;
const modalReplacement = `{/* --- Export Question Modal --- */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-white/10">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Exportar Questão</h3>
                                <p className="text-xs text-gray-500 mt-1">Selecione a prova de destino para copiar esta questão</p>
                            </div>
                            <button onClick={() => setIsExportModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Prova de Destino</label>
                                <select 
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-vg-dark/20 outline-none"
                                    value={selectedTargetExam}
                                    onChange={e => setSelectedTargetExam(e.target.value)}
                                >
                                    <option value="">-- Selecione a avaliação --</option>
                                    {exportTargetExams.map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.title} ({ex.bimester})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2">
                            <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                Cancelar
                            </button>
                            <button onClick={handleExportQuestion} disabled={!selectedTargetExam || isExporting} className="btn px-6 py-2 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Exportar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Collaborators Modal --- */}`;
code = code.replace(modalTarget, modalReplacement);

fs.writeFileSync('src/app/(dashboard)/builder/page.js', code, 'utf8');
console.log("Builder page updated.");
