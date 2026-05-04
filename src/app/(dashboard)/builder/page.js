"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { collection, addDoc, getDocs, limit, query, deleteDoc, doc } from "firebase/firestore";
import { ExamService } from "@/services/examService";
import { getClassesByUser } from "@/services/classesService";
import { UserService } from "@/services/userService";
import ExamPaper from "@/components/ExamPaper";
// AnswerSheet import removed as it is now integrated
import { useReactToPrint } from "react-to-print";
import { Sparkles, PlusCircle, Printer, Save, Trash, ArrowRight, Loader2, FileText, Check, X, Users, Shuffle, Copy, Eye, EyeOff, Activity } from "lucide-react";

export default function BuilderPage() {
    const { user } = useAuth();
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState("Ensino Médio");
    const [year, setYear] = useState("1ª Série"); // Default year for the default level
    const [difficulty, setDifficulty] = useState("Médio");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [examQuestions, setExamQuestions] = useState([]);
    const [examTitle, setExamTitle] = useState("Avaliação de História");

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");

    const [collaborators, setCollaborators] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);
    const [editingCollaborator, setEditingCollaborator] = useState(null); // { userId, name, subject, quota }

    // Bimester & Templates
    const [selectedBimester, setSelectedBimester] = useState("1º Bimestre");
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const EXAM_TEMPLATES = {
        "Linguagens": {
            title: "Avaliação de Linguagens",
            subjects: [
                { name: "Língua Portuguesa", quota: 5 },
                { name: "Arte", quota: 5 },
                { name: "Língua Inglesa", quota: 5 },
                { name: "Educação Física", quota: 5 }
            ]
        },
        "Humanas": {
            title: "Avaliação de Ciências Humanas",
            subjects: [
                { name: "História", quota: 10 },
                { name: "Geografia", quota: 10 }
            ]
        },
        "Ciências": {
            title: "Avaliação de Ciências da Natureza e Matemática",
            subjects: [
                { name: "Matemática", quota: 10 },
                { name: "Ciências", quota: 10 }
            ]
        }
    };

    const applyTemplate = (templateKey) => {
        const template = EXAM_TEMPLATES[templateKey];
        if (!template) return;

        setSelectedTemplate(templateKey);
        setExamTitle(`${selectedBimester} - ${template.title}`);
        setHeaderConfig(prev => ({ ...prev, subject: templateKey }));
        
        // Clear current questions if user confirms or just setup for generation
        if (examQuestions.length > 0 && !confirm("Deseja limpar as questões atuais e aplicar este modelo?")) return;
        setExamQuestions([]);
    };

    const generateFromTemplate = async () => {
        const template = EXAM_TEMPLATES[selectedTemplate];
        if (!template) return;

        setIsGenerating(true);
        setExamQuestions([]);

        try {
            const allQuestions = [];
            for (const sub of template.subjects) {
                // Topic for the AI is the subject name + some context from the bimester if needed
                const res = await fetch('/api/generate', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        topic: sub.name, 
                        difficulty, 
                        level, 
                        year,
                        count: sub.quota 
                    }),
                });
                const data = await res.json();
                if (data.questions) {
                    const questionsWithMeta = data.questions.map(q => ({
                        ...q,
                        id: Math.random() + Date.now(),
                        points: 1,
                        ownerId: user?.uid,
                        subject: sub.name
                    }));
                    allQuestions.push(...questionsWithMeta);
                }
            }
            setExamQuestions(allQuestions);
            alert("Avaliação gerada com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Erro ao gerar avaliação completa.");
        } finally {
            setIsGenerating(false);
        }
    };

    const [scoringMode, setScoringMode] = useState("auto"); // "auto" | "manual"
    const [totalScore, setTotalScore] = useState(3);

    // Level & Year Mapping
    const LEVEL_YEARS = {
        "Fundamental 1": ["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano"],
        "Fundamental 2": ["6º Ano", "7º Ano", "8º Ano", "9º Ano"],
        "Ensino Médio": ["1ª Série", "2ª Série", "3ª Série"],
        "Ensino Superior": ["Superior (Geral)", "1º Semestre", "2º Semestre", "3º Semestre", "4º Semestre", "5º Semestre", "6º Semestre", "7º Semestre", "8º Semestre", "9º Semestre", "10º Semestre"]
    };

    // Header Configuration
    const [headerConfig, setHeaderConfig] = useState({
        schoolName: "Escola Estadual Vila Guaracy",
        teacherName: user?.displayName || "Professor",
        className: "",
        showDate: true,
        logoUrl: "https://vilaguaracy.com.br/logo.png", // Fallback to site logo
        customHeaderImageUrl: "",
        useCustomHeader: false,
        subject: "Geral",
        instructions: "Leia atentamente cada questão antes de responder.\nUtilize caneta esferográfica azul ou preta para preencher o gabarito."
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
        showOMR: true,
        showHabilidades: true // Toggle for showing tags on the printed paper
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

    const handlePrintRequest = async () => {
        setIsPrintModalOpen(true);
        if (user) {
            try {
                const userClasses = await getClassesByUser(user.uid);
                setClasses(userClasses);
            } catch (error) {
                console.error("Erro ao buscar turmas:", error);
            }
        }
    };

    // Load Staff Members
    useEffect(() => {
        const loadStaff = async () => {
            if (user && (user.role === 'gestao' || user.role === 'coordenador')) {
                const staff = await UserService.listStaff();
                // Remove self from list
                setStaffMembers(staff.filter(s => s.uid !== user.uid));
            }
        };
        loadStaff();
    }, [user]);

    const toggleCollaborator = (staff) => {
        const existing = collaborators.find(c => c.userId === staff.uid);
        if (existing) {
            setCollaborators(collaborators.filter(c => c.userId !== staff.uid));
        } else {
            setEditingCollaborator({ userId: staff.uid, name: staff.name, subject: "", quota: 5 });
        }
    };

    const saveCollaboratorConfig = () => {
        if (!editingCollaborator.subject || !editingCollaborator.quota) return alert("Preencha a disciplina e a cota!");
        setCollaborators([...collaborators, editingCollaborator]);
        setEditingCollaborator(null);
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

            // Find student access code if class is selected
            const selectedClassObj = classes.find(c => c.id === selectedClass);
            const studentInfo = selectedClassObj?.students?.find(s => s.name === students[i]);

            newVariations.push({
                id: `${Date.now()}-${i}`, // Unique ID for this specific paper
                student: students[i] || "",
                accessCode: studentInfo?.accessCode || "",
                questions: currentQuestions,
                variationIndex: i,
                isAdapted: false, // Standard version
                classId: selectedClass || null
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

        // Validação de Cotas
        for (const collab of collaborators) {
            const count = examQuestions.filter(q => q.ownerId === collab.userId).length;
            if (count !== Number(collab.quota)) {
                return alert(`O bloco de ${collab.subject} (${collab.name}) está incompleto! Esperado: ${collab.quota}, Atual: ${count}`);
            }
        }

        setIsSaving(true);
        try {
            const examData = {
                title: examTitle || "Sem título",
                headerConfig,
                questions: examQuestions,
                scoringMode,
                totalScore: scoringMode === 'auto' ? (Number(totalScore) || 10) : examQuestions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
                collaborators: collaborators,
                bimester: selectedBimester,
                templateType: selectedTemplate
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
                body: JSON.stringify({ topic, difficulty, level, year }),
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
        const isCollaborator = collaborators.find(c => c.userId === user.uid);
        if (isCollaborator) {
            const currentCount = examQuestions.filter(q => q.ownerId === user.uid).length;
            if (currentCount >= Number(isCollaborator.quota)) {
                return alert(`Você já atingiu sua cota de ${isCollaborator.quota} questões!`);
            }
        }
        setExamQuestions([...examQuestions, { ...question, id: Date.now() + Math.random(), points: 1, ownerId: user.uid }]);
    };

    const updateQuestion = (id, updates) => {
        setExamQuestions(examQuestions.map(q => q.id === id ? { ...q, ...updates } : q));
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
    const removeOption = (index) => {
        const newOptions = [...manualQuestion.options];
        newOptions.splice(index, 1);
        setManualQuestion({ ...manualQuestion, options: newOptions });
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 -m-4">

            {/* --- Left Sidebar: AI & Controls --- */}
            <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden relative">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold flex items-center gap-2 text-vg-hover">
                        <FileText size={18} />
                        Modelos de Avaliação
                    </h2>
                </div>

                <div className="p-4 bg-white border-b border-gray-100">
                    <div className="flex flex-col gap-3">
                        <select 
                            value={selectedBimester} 
                            onChange={(e) => setSelectedBimester(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-200 text-sm font-medium"
                        >
                            <option>1º Bimestre</option>
                            <option>2º Bimestre</option>
                            <option>3º Bimestre</option>
                            <option>4º Bimestre</option>
                        </select>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.keys(EXAM_TEMPLATES).map(key => (
                                <button
                                    key={key}
                                    onClick={() => applyTemplate(key)}
                                    className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all ${selectedTemplate === key ? 'bg-vg-dark text-white border-vg-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-vg-dark'}`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                        {selectedTemplate && (
                            <button
                                onClick={generateFromTemplate}
                                disabled={isGenerating}
                                className="w-full py-2 bg-vg-light text-vg-hover rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-vg-navy hover:text-white transition-all disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                Gerar Prova Completa (20 Questões)
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="font-bold flex items-center gap-2 text-vg-hover">
                        <Sparkles size={18} />
                        Gerador Avulso
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
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 focus:border-vg-dark focus:ring-2 focus:ring-vg-light dark:focus:ring-vg-dark/30 outline-none transition-all bg-white dark:bg-white/5"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Nível</label>
                                <select
                                    value={level}
                                    onChange={(e) => {
                                        const newLevel = e.target.value;
                                        setLevel(newLevel);
                                        setYear(LEVEL_YEARS[newLevel][0]); // Reset year to first option of new level
                                    }}
                                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 focus:border-vg-dark outline-none text-sm"
                                >
                                    {Object.keys(LEVEL_YEARS).map(l => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Ano/Série</label>
                                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 focus:border-vg-dark outline-none text-sm">
                                    {LEVEL_YEARS[level]?.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Dificuldade</label>
                                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-white/10 text-gray-900 dark:text-gray-100 bg-white dark:bg-white/5 focus:border-vg-dark outline-none text-sm">
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
                                <button type="button" onClick={() => generateQuestions(null, true)} disabled={isGenerating} className="px-4 py-3 rounded-xl font-bold text-vg-dark bg-vg-light hover:bg-vg-light border border-vg-light transition-all">+ Mais</button>
                            )}
                        </div>
                    </form>

                    {/* Suggestions List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            {generatedQuestions.length > 0 && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sugestões</h3>}
                            <button onClick={openManualModal} className="text-xs font-bold text-vg-dark hover:underline uppercase tracking-wider flex items-center gap-1">
                                <PlusCircle size={14} /> Criar Manualmente
                            </button>
                        </div>
                        {generatedQuestions.map((q, i) => (
                            <div key={i} className="p-3 rounded-lg border border-gray-200 hover:border-vg-navy hover:bg-vg-light cursor-pointer transition-all group relative bg-white" onClick={() => addToExam(q)}>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><PlusCircle size={18} className="text-vg-dark" /></div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-3 mb-1">{q.text}</p>
                                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Dissertativa'}</span>
                            </div>
                        ))}

                        {generatedQuestions.length > 0 && (
                            <button
                                type="button"
                                onClick={() => generateQuestions(null, true)}
                                disabled={isGenerating}
                                className="w-full py-3 rounded-xl font-bold text-vg-dark bg-vg-light hover:bg-vg-light border border-vg-light transition-all flex items-center justify-center gap-2"
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
                        <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} className="font-bold text-lg border-transparent hover:border-gray-300 focus:border-vg-dark bg-transparent flex-1" />
                    </div>
                    <div className="flex gap-2">
                        {/* Toggle Answers Button */}
                        <button
                            onClick={() => setShowAnswers(!showAnswers)}
                            className={`btn py-2 border ${showAnswers ? 'bg-vg-light border-vg-navy text-vg-hover' : 'btn-outline border-gray-300 text-gray-600'}`}
                            title={showAnswers ? "Ocultar Gabarito" : "Ver Gabarito"}
                        >
                            {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        <button onClick={() => setExamQuestions([])} className="btn btn-outline py-2 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300" title="Limpar"><Trash size={18} /></button>
                        
                        {(user?.role === 'gestao' || user?.role === 'coordenador') && (
                            <button 
                                onClick={() => setIsCollaboratorModalOpen(true)} 
                                className={`btn py-2 border ${collaborators.length > 0 ? 'bg-vg-light border-vg-navy text-vg-hover' : 'btn-outline border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                title="Gerenciar Colaboradores"
                            >
                                <Users size={18} />
                                {collaborators.length > 0 && <span className="ml-1 text-xs">{collaborators.length}</span>}
                            </button>
                        )}

                        <button onClick={handleDiagnostics} className="btn btn-outline py-2 text-gray-500 border-gray-200 hover:bg-gray-100" title="Diagnóstico de Conexão"><Activity size={18} /></button>
                        <button onClick={saveExam} disabled={isSaving} className="btn btn-outline py-2 text-vg-dark border-vg-light hover:bg-vg-light">{isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} <span className="hidden sm:inline">Salvar</span></button>
                        <button onClick={handlePrintRequest} className="btn btn-primary py-2 shadow-lg shadow-vg-light"><Printer size={18} /> <span className="hidden sm:inline">Imprimir / PDF</span></button>
                    </div>
                </div>

                {/* Scoring Config Panel */}
                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm mb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Sistema de Pontuação</label>
                                <select value={scoringMode} onChange={(e) => setScoringMode(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-vg-dark bg-white">
                                    <option value="auto">Automático (Igualitário)</option>
                                    <option value="manual">Manual (Por Questão)</option>
                                </select>
                            </div>
                            {scoringMode === 'auto' && (
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Nota Total da Prova</label>
                                    <input type="number" step="0.1" min="0" value={totalScore === "" ? "" : totalScore} onBlur={(e) => { if (e.target.value === "" || Number(e.target.value) <= 0) setTotalScore(3); }} onChange={(e) => setTotalScore(e.target.value === "" ? "" : Number(e.target.value))} className="p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-vg-dark w-24 bg-white" placeholder="3.0" />
                                </div>
                            )}
                        </div>
                        <div>
                            {scoringMode === 'auto' ? (
                                <div className="text-right">
                                    <span className="text-sm font-bold text-vg-dark block">
                                        {examQuestions.length > 0 ? ((Number(totalScore) || 3) / examQuestions.length).toFixed(2) : 0} pts por questão
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Valor distribuído igualmente</span>
                                </div>
                            ) : (
                                <div className="text-right">
                                    <span className="text-sm font-bold text-vg-dark block">
                                        Total: {examQuestions.reduce((acc, q) => acc + (Number(q.points) || 0), 0)} pts
                                    </span>
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Soma da pontuação manual</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Header Config Panel - Hidden as per user request to use standardized school header */}
                {false && (
                <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                    {/* ... Header configuration ... */}
                </div>
                )}

                {/* Preview Area (Shows Standard Exam) */}
                <div className="flex-1 overflow-y-auto bg-gray-200/50 dark:bg-black/20 rounded-xl p-8 flex justify-center items-start shadow-inner">
                    <div className="origin-top scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform">
                        <ExamPaper
                            questions={examQuestions}
                            title={examTitle}
                            collaborators={collaborators}
                            headerConfig={headerConfig}
                            showAnswers={showAnswers}
                            scoringMode={scoringMode}
                            totalScore={Number(totalScore) || 10}
                            onQuestionChange={updateQuestion}
                            printConfig={printConfig}
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

                            <ExamPaper
                                questions={v.questions}
                                title={examTitle}
                                collaborators={collaborators}
                                headerConfig={{
                                    ...headerConfig,
                                    studentName: v.student || "________________",
                                    accessCode: v.accessCode || "",
                                    examId: v.id,
                                    classId: v.classId,
                                }}
                                showAnswers={false}
                                isAdapted={v.isAdapted}
                                scoringMode={scoringMode}
                                totalScore={Number(totalScore) || 10}
                                printConfig={printConfig}
                            />
                        </div>
                    ))}
                    {/* Fallback */}
                    {printVariations.length === 0 && (
                        <ExamPaper questions={examQuestions} title={examTitle} headerConfig={headerConfig} scoringMode={scoringMode} totalScore={Number(totalScore) || 10} printConfig={printConfig} />
                    )}
                </div>
            </div>


            {/* --- Collaborators Modal --- */}
            {isCollaboratorModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-white/10">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                                    <Users className="text-vg-dark" /> Colaboradores
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Quem pode editar esta prova?</p>
                            </div>
                            <button onClick={() => setIsCollaboratorModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                {staffMembers.map(member => (
                                    <div key={member.uid} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${collaborators.find(c => c.userId === member.uid) ? 'bg-vg-light border-vg-navy' : 'border-gray-100'}`}>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-800">{member.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{member.role}</p>
                                        </div>
                                        {collaborators.find(c => c.userId === member.uid) ? (
                                            <button onClick={() => toggleCollaborator(member)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash size={18} /></button>
                                        ) : (
                                            <button onClick={() => toggleCollaborator(member)} className="btn btn-outline py-1 px-3 text-xs">Adicionar</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 text-center">
                            <button onClick={() => setIsCollaboratorModalOpen(false)} className="btn btn-primary w-full py-2">Concluir</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Collaborator Config Modal --- */}
            {editingCollaborator && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-4">
                        <h3 className="font-bold text-lg text-gray-800">Configurar Bloco: {editingCollaborator.name}</h3>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Disciplina / Bloco</label>
                            <input 
                                type="text" 
                                value={editingCollaborator.subject} 
                                onChange={(e) => setEditingCollaborator({...editingCollaborator, subject: e.target.value})}
                                placeholder="Ex: Matemática"
                                className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-vg-dark"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Cota de Questões</label>
                            <input 
                                type="number" 
                                value={editingCollaborator.quota} 
                                onChange={(e) => setEditingCollaborator({...editingCollaborator, quota: e.target.value})}
                                className="w-full p-3 rounded-xl border border-gray-300 outline-none focus:border-vg-dark"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingCollaborator(null)} className="btn btn-outline flex-1 py-2">Cancelar</button>
                            <button onClick={saveCollaboratorConfig} className="btn btn-primary flex-1 py-2">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
            {isPrintModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                            <div>
                                <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                                    <Printer className="text-vg-dark" /> Configurar Impressão
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
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${printConfig.shuffleQuestions ? 'bg-vg-dark border-vg-dark text-white' : 'border-gray-300'}`}>
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
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${printConfig.shuffleOptions ? 'bg-vg-dark border-vg-dark text-white' : 'border-gray-300'}`}>
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

                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${printConfig.showHabilidades ? 'bg-vg-dark border-vg-dark text-white' : 'border-gray-300'}`}>
                                            {printConfig.showHabilidades && <Check size={14} />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={printConfig.showHabilidades} onChange={(e) => setPrintConfig({ ...printConfig, showHabilidades: e.target.checked })} />
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                <FileText size={14} /> Exibir Habilidades
                                            </div>
                                            <p className="text-xs text-gray-500">Mostra a habilidade avaliada em cada questão.</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Right: Students/Copies */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-gray-400 uppercase tracking-wide">Destinatários</h4>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                                        Importar Turma
                                    </label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:border-vg-dark outline-none"
                                        value={selectedClass}
                                        onChange={(e) => {
                                            const classId = e.target.value;
                                            setSelectedClass(classId);
                                            const selectedClassObj = classes.find(c => c.id === classId);
                                            if (selectedClassObj && selectedClassObj.students) {
                                                const studentNames = selectedClassObj.students.map(s => s.name).join('\n');
                                                setPrintConfig(prev => ({ ...prev, studentList: studentNames }));
                                            } else {
                                                setPrintConfig(prev => ({ ...prev, studentList: "" }));
                                            }
                                        }}
                                    >
                                        <option value="">-- Preencher manualmente --</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.students?.length || 0} alunos)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                                        Lista de Alunos (1 por linha)
                                    </label>
                                    <textarea
                                        className="w-full h-40 p-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm focus:border-vg-dark outline-none resize-none custom-scrollbar"
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
                                    <label className="text-xs font-bold text-vg-dark dark:text-vg-navy block mb-2 flex items-center gap-2">
                                        <Eye size={14} /> Cópias Adaptadas (Fonte Ampliada)
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <Copy size={18} className="text-vg-navy" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={printConfig.adaptedCopies}
                                            onChange={(e) => setPrintConfig({ ...printConfig, adaptedCopies: parseInt(e.target.value) || 0 })}
                                            className="w-full p-3 rounded-xl border border-vg-light dark:border-vg-dark/30 bg-vg-light dark:bg-vg-navy/10 font-bold text-vg-hover dark:text-vg-navy"
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
                                className="btn btn-primary px-8 flex items-center gap-2 shadow-xl shadow-vg-dark/20"
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
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Enunciado</label><textarea value={manualQuestion.text} onChange={(e) => setManualQuestion({ ...manualQuestion, text: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300 focus:border-vg-dark outline-none min-h-[100px]" placeholder="Digite a pergunta aqui..." /></div>
                            <div><label className="block text-sm font-bold text-gray-700 mb-1">Link de Imagem (Opcional)</label><input type="text" value={manualQuestion.imageUrl || ""} onChange={(e) => setManualQuestion({ ...manualQuestion, imageUrl: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300 focus:border-vg-dark outline-none text-sm" placeholder="https://exemplo.com/imagem.jpg" /></div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Habilidade / BNCC (Opcional)</label>
                                <input type="text" value={manualQuestion.habilidade || ""} onChange={(e) => setManualQuestion({ ...manualQuestion, habilidade: e.target.value })} className="w-full p-3 rounded-lg border border-gray-300 focus:border-vg-dark outline-none" placeholder="Ex: EF06HI02..." />
                            </div>
                            {manualQuestion.type === 'multiple_choice' && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700">Alternativas</label>
                                    {manualQuestion.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <span className="font-mono font-bold text-gray-400 w-6">{String.fromCharCode(65 + idx)})</span>
                                            <input type="text" value={opt} onChange={(e) => updateOption(idx, e.target.value)} className="flex-1 p-2 rounded border border-gray-300 focus:border-vg-dark outline-none text-sm" placeholder={`Opção ${idx + 1}`} />
                                            <button onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash size={16} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setManualQuestion({ ...manualQuestion, options: [...manualQuestion.options, ""] })} className="text-sm font-bold text-vg-dark hover:underline flex items-center gap-1 mt-2"><PlusCircle size={16} /> Adicionar Alternativa</button>
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
