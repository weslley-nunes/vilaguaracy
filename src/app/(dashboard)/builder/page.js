"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { collection, addDoc, getDocs, limit, query, deleteDoc, doc } from "firebase/firestore";
import { ExamService } from "@/services/examService";
import ExamPaper from "@/components/ExamPaper";
// AnswerSheet import removed as it is now integrated
import { useReactToPrint } from "react-to-print";
import { Sparkles, PlusCircle, Printer, Save, Trash, ArrowRight, Loader2, FileText, Check, X, Users, Shuffle, Copy, Eye, EyeOff, Activity } from "lucide-react";

export default function BuilderPage() {
    const { user } = useAuth();
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("Médio");
    const [level, setLevel] = useState("Ensino Médio");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [examQuestions, setExamQuestions] = useState([]);
    const [examTitle, setExamTitle] = useState("Avaliação de História");

    // Header Configuration
    const [headerConfig, setHeaderConfig] = useState({
        schoolName: "Escola Exemplo",
        teacherName: user?.displayName || "Professor",
        className: "",
        showDate: true,
        logoUrl: "",
        customHeaderImageUrl: "",
        useCustomHeader: false
    });

    // Teacher View State
    const [showAnswers, setShowAnswers] = useState(false);

    // Refs
    const printRef = useRef();

    // Manual Question State
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualQuestion, setManualQuestion] = useState({
        text: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correct: ""
    });

    // --- Print & Variation Logic ---
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isPreparingPrint, setIsPreparingPrint] = useState(false);
    const [printVariations, setPrintVariations] = useState([]); // Array of { questions, student, id }

    const [printConfig, setPrintConfig] = useState({
        shuffleQuestions: false,
        shuffleOptions: false,
        studentList: "", // Text area content
        copies: 1,
        adaptedCopies: 0, // New: Copies with large font/accessibility
        // includeAnswerSheet removed as separate toggle, assume integrated. Or repurpose to "Hide OMR"?
        // User asked for it to be integrated. We can keep a toggle to HIDE it if desired.
        showOMR: true
    });

    // shuffling helper
    const shuffleArray = (array) => {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    };

    const handlePrintRequest = () => {
        setIsPrintModalOpen(true);
    };

    const generateAndPrint = async () => {
        setIsPreparingPrint(true);

        // Parse Students
        const students = printConfig.studentList
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const iterations = students.length > 0 ? students.length : (printConfig.copies || 1);
        const newVariations = [];

        for (let i = 0; i < iterations; i++) {
            let currentQuestions = [...examQuestions];

            // 1. Shuffle Questions
            if (printConfig.shuffleQuestions) {
                currentQuestions = shuffleArray(currentQuestions);
            }

            // 2. Shuffle Options (Deep clone required to not affect other iterations if we mutate)
            if (printConfig.shuffleOptions) {
                currentQuestions = currentQuestions.map(q => {
                    if (q.type !== 'multiple_choice' || !q.options) return q;
                    return {
                        ...q,
                        options: shuffleArray(q.options)
                    };
                });
            }

            newVariations.push({
                id: `${Date.now()}-${i}`, // Unique ID for this specific paper
                student: students[i] || "",
                questions: currentQuestions,
                variationIndex: i,
                isAdapted: false // Standard version
            });
        }

        // Adapted Copies Generation
        for (let i = 0; i < printConfig.adaptedCopies; i++) {
            let currentQuestions = [...examQuestions];
            // Apply shuffling if selected (same logic as above)
            if (printConfig.shuffleQuestions) {
                currentQuestions = shuffleArray(currentQuestions);
            }
            if (printConfig.shuffleOptions) {
                currentQuestions = currentQuestions.map(q => {
                    if (q.type !== 'multiple_choice' || !q.options) return q;
                    return { ...q, options: shuffleArray(q.options) };
                });
            }

            newVariations.push({
                id: `ADAPTED-${Date.now()}-${i}`,
                student: "", // Adapted copies generally don't have names pre-filled, or we could add logic
                questions: currentQuestions,
                variationIndex: i,
                isAdapted: true // Flag for large font/accessibility
            });
        }

        setPrintVariations(newVariations);

        // Allow DOM to update with newVariations before printing
        setTimeout(() => {
            triggerPrint();
            setIsPreparingPrint(false);
            setIsPrintModalOpen(false);
        }, 1000);
    };

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: examTitle,
    });


    // --- Diagnostics Logic ---
    const handleDiagnostics = async () => {
        let report = "Relatório de Diagnóstico (v2):\n";

        // 1. Connectivity
        report += `1. Online (Navegador): ${navigator.onLine ? "SIM" : "NÃO"}\n`;

        // 2. Auth
        if (!user) {
            report += "2. Auth: DESLOGADO (Impossível salvar)\n";
        } else {
            report += `2. Auth: OK (${user.email})\n   UID: ${user.uid}\n`;
        }

        // 3. Firestore Connection Test
        try {
            report += "3. Testando Conexão DB... ";
            // Try to write to a simplified path
            const testRef = collection(db, "diagnostics");

            // Set a strict 5s timeout for the test
            const testPromise = addDoc(testRef, {
                test: true,
                timestamp: new Date(),
                uid: user?.uid || "anon"
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("TIMEOUT_15S")), 15000)
            );

            await Promise.race([testPromise, timeoutPromise]);
            report += "SUCESSO! (Escrita confirmada)\n";

            // Cleanup? We leave it for now to certify data is there.
        } catch (e) {
            console.error("Diagnostic Error:", e);
            report += `FALHA!\n   Erro: ${e.message}\n`;
            if (e.code) report += `   Código Firebase: ${e.code}\n`;
        }

        alert(report);
    };


    // --- Existing API Logic ---
    // --- Centralized Save Logic ---
    const saveExam = async () => {
        if (!user || examQuestions.length === 0) return alert("Adicione questões antes de salvar!");

        setIsSaving(true);
        try {
            const examData = {
                title: examTitle || "Sem título",
                headerConfig,
                questions: examQuestions,
                // Status, dates, and teacherId are handled by the service
            };

            const result = await ExamService.save(examData, user);

            if (result.success) {
                alert(`Avaliação salva com sucesso! (${result.method === 'fallback' ? 'Via Backup' : 'Conexão Direta'})`);
                // Optional: Redirect to "My Exams" or clear
            }
        } catch (e) {
            console.error("Critical Save Error:", e);
            alert("Erro ao salvar: " + (e.message || "Verifique sua conexão."));
        } finally {
            setIsSaving(false);
        }
    };

    const generateQuestions = async (e, append = false) => {
        if (e) e.preventDefault();
        if (!topic.trim()) return;
        setIsGenerating(true);
        if (!append) setGeneratedQuestions([]);

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({ topic, difficulty, level }),
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);
            if (data.questions) {
                setGeneratedQuestions(prev => append ? [...prev, ...data.questions] : data.questions);
            } else {
                alert("A IA não retornou nenhuma questão válida.");
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao conectar com o servidor.");
        }
        setIsGenerating(false);
    };

    const addToExam = (question) => {
        setExamQuestions([...examQuestions, { ...question, id: Date.now() + Math.random() }]);
    };

    // Manual Question Helpers
    const openManualModal = () => {
        setManualQuestion({ text: "", imageUrl: "", type: "multiple_choice", options: ["", "", "", ""], correct: "" });
        setIsManualModalOpen(true);
    };
    const handleManualSave = () => {
        if (!manualQuestion.text) return alert("Digite o enunciado!");
        addToExam({ ...manualQuestion, id: Date.now() });
        setIsManualModalOpen(false);
    };
    const updateOption = (index, value) => {
        const newOptions = [...manualQuestion.options];
        newOptions[index] = value;
        setManualQuestion({ ...manualQuestion, options: newOptions });
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 -m-4">

            {/* --- Left Sidebar: AI & Controls --- */}
            <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold flex items-center gap-2 text-indigo-700">
                        <Sparkles size={18} />
                        Gerador de Questões
                    </h2>
                </div>

                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar pb-20">
                    <form onSubmit={(e) => generateQuestions(e, false)} className="mb-6 space-y-4">
                        {/* Form Inputs (Topic, Level, etc) - UNCHANGED logic, just compressed for brevity in rewrite if needed, but I will keep full since I am rewriting. */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Sobre o que é a prova?</label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ex: Revolução Francesa..."
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/30 outline-none transition-all bg-white dark:bg-white/5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Nível</label>
                                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 focus:border-indigo-500 outline-none text-sm">
                                    <option>Fundamental 1</option><option>Fundamental 2</option><option>Ensino Médio</option><option>Ensino Superior</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Dificuldade</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 focus:border-indigo-500 outline-none text-sm">
                                    <option>Fácil</option><option>Médio</option><option>Difícil</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" disabled={isGenerating} className="flex-1 btn btn-primary py-3 flex items-center justify-center gap-2">
                                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                <span>Gerar</span>
                            </button>
                            {generatedQuestions.length > 0 && (
                                <button type="button" onClick={() => generateQuestions(null, true)} disabled={isGenerating} className="px-4 py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all">+ Mais</button>
                            )}
                        </div>
                    </form>

                    {/* Suggestions List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            {generatedQuestions.length > 0 && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sugestões</h3>}
                            <button onClick={openManualModal} className="text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wider flex items-center gap-1">
                                <PlusCircle size={14} /> Criar Manualmente
                            </button>
                        </div>
                        {generatedQuestions.map((q, i) => (
                            <div key={i} className="p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-all group relative bg-white" onClick={() => addToExam(q)}>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><PlusCircle size={18} className="text-indigo-600" /></div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-3 mb-1">{q.text}</p>
                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}</span>
                            </div>
                        ))}

                        {generatedQuestions.length > 0 && (
                            <button
                                type="button"
                                onClick={() => generateQuestions(null, true)}
                                disabled={isGenerating}
                                className="w-full py-3 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                Gerar Mais Questões
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Right: Preview & Settings --- */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Toolbar */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
                    <div className="flex gap-4 flex-1">
                        <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="font-bold text-lg border-transparent hover:border-gray-300 focus:border-indigo-500 bg-transparent flex-1" />
                    </div>
                    <div className="flex gap-2">
                        {/* Toggle Answers Button */}
                        <button
                            onClick={() => setShowAnswers(!showAnswers)}
                            className={`btn py-2 border ${showAnswers ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'btn-outline border-gray-300 text-gray-600'}`}
                            title={showAnswers ? "Ocultar Gabarito" : "Ver Gabarito"}
                        >
                            {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        <button onClick={() => setExamQuestions([])} className="btn btn-outline py-2 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300" title="Limpar"><Trash size={18} /></button>
                        <button onClick={handleDiagnostics} className="btn btn-outline py-2 text-gray-500 border-gray-200 hover:bg-gray-100" title="Diagnóstico de Conexão"><Activity size={18} /></button>
                        <button onClick={saveExam} disabled={isSaving} className="btn btn-outline py-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">{isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} <span className="hidden sm:inline">Salvar</span></button>
                        <button onClick={handlePrintRequest} className="btn btn-primary py-2 shadow-lg shadow-indigo-200"><Printer size={18} /> <span className="hidden sm:inline">Imprimir / PDF</span></button>
                    </div>
                </div>

                {/* Header Config Panel */}
                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                    {/* ... Header configuration (Same as before) ... */}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><FileText size={16} /> Configuração do Cabeçalho</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Personalizar Cabeçalho da Escola</span>
                            <button onClick={() => setHeaderConfig({ ...headerConfig, useCustomHeader: !headerConfig.useCustomHeader })} className={`w-8 h-4 flex items-center rounded-full p-0.5 duration-300 ease-in-out ${headerConfig.useCustomHeader ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <div className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${headerConfig.useCustomHeader ? 'translate-x-4' : ''}`}></div>
                            </button>
                        </div>
                    </div>
                    {headerConfig.useCustomHeader ? (
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Upload da Imagem do Cabeçalho</label>
                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 px-4 py-2 flex items-center gap-2 rounded-lg font-bold text-sm transition-colors border border-indigo-200 dark:border-indigo-800">
                                        <PlusCircle size={16} />
                                        Escolher Arquivo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        const img = new Image();
                                                        img.onload = () => {
                                                            const canvas = document.createElement('canvas');
                                                            let width = img.width;
                                                            let height = img.height;
                                                            const MAX_WIDTH = 1000; // max width optimized for printing

                                                            if (width > MAX_WIDTH) {
                                                                height = Math.round((height * MAX_WIDTH) / width);
                                                                width = MAX_WIDTH;
                                                            }

                                                            canvas.width = width;
                                                            canvas.height = height;

                                                            const ctx = canvas.getContext('2d');
                                                            ctx.drawImage(img, 0, 0, width, height);

                                                            // Convert back to Base64 using JPEG and 80% quality
                                                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                                                            setHeaderConfig({ ...headerConfig, customHeaderImageUrl: compressedBase64 });
                                                        };
                                                        img.src = event.target.result;
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                    {headerConfig.customHeaderImageUrl && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check size={14} /> Imagem Selecionada</span>
                                            <button
                                                onClick={() => setHeaderConfig({ ...headerConfig, customHeaderImageUrl: "" })}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Dica: Use uma imagem retangular que substitua todo o espaço original (Escola, Professor, etc).</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Escola</label><input type="text" value={headerConfig.schoolName} onChange={(e) => setHeaderConfig({ ...headerConfig, schoolName: e.target.value })} className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/20 text-sm" /></div>
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Professor</label><input type="text" value={headerConfig.teacherName} onChange={(e) => setHeaderConfig({ ...headerConfig, teacherName: e.target.value })} className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/20 text-sm" /></div>
                            <div><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Logo URL</label><input type="text" value={headerConfig.logoUrl} onChange={(e) => setHeaderConfig({ ...headerConfig, logoUrl: e.target.value })} className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/20 text-sm" /></div>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1"><label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Turma</label><input type="text" value={headerConfig.className} onChange={(e) => setHeaderConfig({ ...headerConfig, className: e.target.value })} className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white bg-white dark:bg-black/20 text-sm" /></div>
                                <div className="flex items-center gap-1 mb-2">
                                    <input type="checkbox" checked={headerConfig.showDate} onChange={(e) => setHeaderConfig({ ...headerConfig, showDate: e.target.checked })} /> <span className="text-xs text-gray-700 dark:text-gray-300">Data</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Area (Shows Standard Exam) */}
                <div className="flex-1 overflow-y-auto bg-gray-200/50 dark:bg-black/20 rounded-xl p-8 flex justify-center items-start shadow-inner">
                    <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
                        <ExamPaper
                            questions={examQuestions}
                            title={examTitle}
                            headerConfig={headerConfig}
                            showAnswers={showAnswers}
                        />
                    </div>
                </div>
            </div>

            {/* --- Hidden Print Container --- */}
            <div style={{ display: "none" }}>
                <div ref={printRef}>
                    {printVariations.map((v, idx) => (
                        <div key={v.id} className="page-break">
                            {/* Page Break logic: first item doesn't strictly need one but subsequent do. 'page-break-before: always' handles this. */}
                            <style>{`@media print { .page-break { page-break-before: always; } }`}</style>

                            {/* Exam Paper with Integrated OMR */}
                            <ExamPaper
                                questions={v.questions}
                                title={examTitle}
                                headerConfig={{
                                    ...headerConfig,
                                    studentName: v.student || "________________",
                                    examId: v.id, // For QR
                                    // Use 'v.variationIndex' if we want to show "Prova Tipo A" etc.
                                }}
                                // Typically we DONT show answers in student prints unless requested
                                showAnswers={false}
                                isAdapted={v.isAdapted}
                            />
                        </div>
                    ))}
                    {/* Fallback */}
                    {printVariations.length === 0 && (
                        <ExamPaper questions={examQuestions} title={examTitle} headerConfig={headerConfig} />
                    )}
                </div>
            </div>


            {/* --- Print Settings Modal --- */}
            {isPrintModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                                    <Printer className="text-indigo-600" /> Configurar Impressão
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Personalize as cópias e variações da prova.</p>
                            </div>
                            <button onClick={() => setIsPrintModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left: Toggles */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wide">Variações</h4>

                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${printConfig.shuffleQuestions ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                                            {printConfig.shuffleQuestions && <Check size={14} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={printConfig.shuffleQuestions} onChange={(e) => setPrintConfig({ ...printConfig, shuffleQuestions: e.target.checked })} />
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                <Shuffle size={14} /> Embaralhar Questões
                                            </div>
                                            <p className="text-xs text-gray-500">Muda a ordem das perguntas para cada aluno/cópia.</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${printConfig.shuffleOptions ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'}`}>
                                            {printConfig.shuffleOptions && <Check size={14} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={printConfig.shuffleOptions} onChange={(e) => setPrintConfig({ ...printConfig, shuffleOptions: e.target.checked })} />
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                <Shuffle size={14} /> Embaralhar Alternativas
                                            </div>
                                            <p className="text-xs text-gray-500">Muda a ordem das opções (A, B, C...) em cada questão.</p>
                                        </div>
                                    </label>
                                </div>
                                {/* OMR Toggle removed as user wants it integrated. We could add "Hide OMR" if requested later. */}
                            </div>

                            {/* Right: Students/Copies */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wide">Destinatários</h4>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                                        Lista de Alunos (1 por linha)
                                    </label>
                                    <textarea
                                        className="w-full h-40 p-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:border-indigo-500 outline-none resize-none custom-scrollbar"
                                        placeholder="Joao Silva&#10;Maria Oliveira&#10;..."
                                        value={printConfig.studentList}
                                        onChange={(e) => setPrintConfig({ ...printConfig, studentList: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 text-right">
                                        {printConfig.studentList.split('\n').filter(l => l.trim()).length} alunos detectados
                                    </p>
                                </div>

                                <div className={`transition-all ${printConfig.studentList.trim().length > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                                        Ou Número de Cópias (Genéricas)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <Copy size={18} className="text-gray-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={printConfig.copies}
                                            onChange={(e) => setPrintConfig({ ...printConfig, copies: parseInt(e.target.value) || 1 })}
                                            className="w-full p-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className={`transition-all ${printConfig.studentList.trim().length > 0 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-2 flex items-center gap-2">
                                        <Eye size={14} /> Cópias Adaptadas (Fonte Ampliada)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <Copy size={18} className="text-indigo-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={printConfig.adaptedCopies}
                                            onChange={(e) => setPrintConfig({ ...printConfig, adaptedCopies: parseInt(e.target.value) || 0 })}
                                            className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/10 font-bold text-indigo-700 dark:text-indigo-300"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Gera versões com fonte maior e sem serifa para baixa visão.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex justify-end gap-3">
                            <button onClick={() => setIsPrintModalOpen(false)} className="btn btn-outline text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10">
                                Cancelar
                            </button>
                            <button
                                onClick={generateAndPrint}
                                disabled={isPreparingPrint}
                                className="btn btn-primary px-8 flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                            >
                                {isPreparingPrint ? <Loader2 className="animate-spin" /> : <Printer size={18} />}
                                {isPreparingPrint ? "Gerando..." : "Gerar e Imprimir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Manual Modal - ... (Same) ... */}
            {isManualModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                        {/* ... Modal Content ... */}
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Adicionar Questão Manual</h3>
                            <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-red-500"><Trash size={20} className="rotate-45" /></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-4">
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Enunciado</label><textarea value={manualQuestion.text} onChange={(e) => setManualQuestion({ ...manualQuestion, text: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none min-h-[100px]" placeholder="Digite a pergunta aqui..." /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Link de Imagem (Opcional)</label><input type="text" value={manualQuestion.imageUrl || ""} onChange={(e) => setManualQuestion({ ...manualQuestion, imageUrl: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none text-sm" placeholder="https://exemplo.com/imagem.jpg" /></div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                                <select value={manualQuestion.type} onChange={(e) => setManualQuestion({ ...manualQuestion, type: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none">
                                    <option value="multiple_choice">Múltipla Escolha</option><option value="text">Dissertativa</option>
                                </select>
                            </div>
                            {manualQuestion.type === 'multiple_choice' && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700">Alternativas</label>
                                    {manualQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <span className="font-mono font-bold text-gray-400 w-6">{String.fromCharCode(65 + idx)})</span>
                                            <input type="text" value={opt} onChange={(e) => updateOption(idx, e.target.value)} className="flex-1 p-2 rounded border border-gray-300 focus:border-indigo-500 outline-none text-sm" placeholder={`Opção ${idx + 1}`} />
                                            <button onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash size={16} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setManualQuestion({ ...manualQuestion, options: [...manualQuestion.options, ""] })} className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-2"><PlusCircle size={16} /> Adicionar Alternativa</button>
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button onClick={() => setIsManualModalOpen(false)} className="btn btn-outline text-gray-600 border-gray-300 hover:bg-gray-100">Cancelar</button>
                            <button onClick={handleManualSave} className="btn btn-primary px-8">Adicionar na Prova</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
