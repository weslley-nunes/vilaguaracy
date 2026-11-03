"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ExamService } from "@/services/examService";
import { getClassesByUser } from "@/services/classesService";
import { 
    FileText, Loader2, Trash2, Calendar, Archive, BarChart2, 
    Users, Target, Printer, List, CheckCircle, XCircle, Search 
} from "lucide-react";
import Link from "next/link";

export default function AvaliacoesAnterioresPage() {
    const { user, activeRole } = useAuth();
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [corrections, setCorrections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Main View Tabs: "provas" | "resultados"
    const [mainTab, setMainTab] = useState("provas");
    const [selectedBimester, setSelectedBimester] = useState("3º Bimestre");
    const [searchTerm, setSearchTerm] = useState("");

    // Resultados View States
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [resultSubTab, setResultSubTab] = useState("cards"); // "cards" | "print" | "summary"
    const [sortOrder, setSortOrder] = useState("alfabetica");

    useEffect(() => {
        if (user) {
            loadData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, activeRole]);

    const loadData = async () => {
        setLoading(true);
        try {
            const isManagement = activeRole === 'gestao' || activeRole === 'coordenador';
            const [archivedExams, classList] = await Promise.all([
                isManagement ? ExamService.listAllArchived() : ExamService.listArchivedByTeacher(user.uid),
                getClassesByUser()
            ]);

            let finalExams = archivedExams;
            if (!isManagement) {
                finalExams = archivedExams.filter(exam => {
                    const isCollab = exam.collaboratorIds?.includes(user.uid);
                    const isOwner = exam.teacherId === user.uid;
                    const isTemplate = !!exam.templateType;
                    return isCollab || (isOwner && !isTemplate);
                });
            }

            setExams(finalExams);
            setClasses(classList);
            if (classList.length > 0 && !selectedClassId) {
                setSelectedClassId(classList[0].id);
            }
        } catch (error) {
            console.error("Error loading archived exams:", error);
            alert("Erro ao carregar avaliações anteriores.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Tem certeza que deseja excluir esta avaliação arquivada?")) return;
        try {
            await ExamService.delete(id);
            setExams(exams.filter(e => e.id !== id));
        } catch (error) {
            alert("Erro ao excluir.");
        }
    };

    // Available Bimesters in Archived Exams
    const availableBimesters = ["Todos", "3º Bimestre", "2º Bimestre", "1º Bimestre"];

    // Filtered Exams for "Provas" Tab
    const filteredExamsList = exams.filter(exam => {
        const matchesBimester = selectedBimester === "Todos" || exam.bimester === selectedBimester;
        const matchesSearch = !searchTerm || (exam.title || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesBimester && matchesSearch;
    });

    // Filtered Exams for "Resultados" Tab (by Class & Bimester)
    const selectedClassObj = classes.find(c => c.id === selectedClassId);
    const examsForSelectedClass = exams.filter(exam => {
        if (!selectedClassId) return false;
        const matchesBim = selectedBimester === "Todos" || exam.bimester === selectedBimester;
        if (!matchesBim) return false;

        if (exam.classId === selectedClassId) return true;
        if (selectedClassObj && exam.className === selectedClassObj.name) return true;
        if (selectedClassObj && exam.title?.includes(selectedClassObj.name)) return true;
        return false;
    });

    // Auto-select exam in Results view when class or bimester changes
    useEffect(() => {
        if (examsForSelectedClass.length > 0) {
            if (!examsForSelectedClass.some(e => e.id === selectedExamId)) {
                setSelectedExamId(examsForSelectedClass[0].id);
            }
        } else {
            setSelectedExamId("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId, selectedBimester, exams, classes]);

    // Fetch Corrections when selectedExamId or selectedClassId changes
    useEffect(() => {
        if (!selectedExamId || !selectedClassId) {
            setCorrections([]);
            return;
        }
        const fetchCorrections = async () => {
            try {
                const results = await ExamService.listCorrectionsByExam(selectedExamId);
                const selectedClass = classes.find(c => c.id === selectedClassId);
                if (selectedClass) {
                    const filtered = results.filter(c => 
                        c.classId === selectedClass.name || c.classId === selectedClass.id
                    );
                    setCorrections(filtered);
                } else {
                    setCorrections([]);
                }
            } catch (e) {
                console.error("Failed to load corrections", e);
            }
        };
        fetchCorrections();
    }, [selectedExamId, selectedClassId, classes]);

    const openExamResults = (exam) => {
        // Find matching class
        const matchedClass = classes.find(c => 
            c.id === exam.classId || 
            c.name === exam.className || 
            (exam.title && exam.title.includes(c.name))
        );
        if (matchedClass) {
            setSelectedClassId(matchedClass.id);
        }
        if (exam.bimester) {
            setSelectedBimester(exam.bimester);
        }
        setSelectedExamId(exam.id);
        setMainTab("resultados");
    };

    const selectedExam = examsForSelectedClass.find(e => e.id === selectedExamId);
    const allSubjects = Array.from(new Set(corrections.flatMap(c => Object.keys(c.scoresBySubject || {})))).sort();

    const sortedCorrections = [...corrections].sort((a, b) => {
        if (sortOrder === "maior") return b.score - a.score;
        if (sortOrder === "menor") return a.score - b.score;
        if (sortOrder === "alfabetica") return (a.studentName || "").localeCompare(b.studentName || "");
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
    });

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
                <Loader2 className="animate-spin text-vg-dark" size={40} />
                <p className="text-gray-500 font-medium">Carregando arquivo de avaliações e resultados...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-2 sm:p-6 flex flex-col print:max-w-full print:w-full print:p-0 print:block">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Archive className="text-vg-dark" size={28} />
                        Avaliações Anteriores
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Histórico completo de provas aplicadas e resultados dos bimestres encerrados.
                    </p>
                </div>

                {/* Bimester Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
                    {availableBimesters.map(bim => (
                        <button
                            key={bim}
                            onClick={() => setSelectedBimester(bim)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedBimester === bim
                                    ? "bg-vg-dark text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            {bim}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Navigation Tabs (Provas vs Resultados) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm print:hidden">
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setMainTab("provas")}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            mainTab === "provas"
                                ? "bg-vg-light text-vg-dark border border-vg-dark/20 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                    >
                        <FileText size={18} />
                        Cadernos de Prova ({filteredExamsList.length})
                    </button>
                    <button
                        onClick={() => setMainTab("resultados")}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            mainTab === "resultados"
                                ? "bg-vg-light text-vg-dark border border-vg-dark/20 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                    >
                        <BarChart2 size={18} />
                        Resultados & Notas
                    </button>
                </div>

                {mainTab === "provas" && (
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar avaliação..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm outline-none focus:border-vg-dark"
                        />
                    </div>
                )}
            </div>

            {/* TAB 1: CADERNOS DE PROVA */}
            {mainTab === "provas" && (
                <>
                    {filteredExamsList.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
                            <Archive className="mx-auto text-gray-300 mb-4" size={64} />
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                Nenhuma avaliação arquivada encontrada ({selectedBimester})
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                                Selecione outro bimestre acima para visualizar avaliações anteriores.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredExamsList.map((exam) => (
                                <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-vg-light text-vg-dark px-2.5 py-1 rounded-full">
                                                {exam.bimester || "Anterior"}
                                            </span>
                                            {exam.className && (
                                                <span className="text-[10px] font-bold uppercase text-gray-400">
                                                    {exam.className}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-base text-gray-800 dark:text-white mb-3 line-clamp-2">
                                            {exam.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <FileText size={14} /> {exam.questions?.length || 0} Questões
                                            </span>
                                            {exam.createdAt?.seconds && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} /> {new Date(exam.createdAt.seconds * 1000).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-5 py-3 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-2">
                                        {(activeRole === 'gestao' || activeRole === 'coordenador') ? (
                                            <button 
                                                onClick={() => handleDelete(exam.id)} 
                                                className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        ) : <div />}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openExamResults(exam)}
                                                className="text-vg-navy dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                                            >
                                                <BarChart2 size={14} /> Notas
                                            </button>
                                            <Link 
                                                href={`/builder?id=${exam.id}`}
                                                className="text-vg-dark dark:text-white bg-vg-light hover:bg-vg-dark hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Ver Prova
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* TAB 2: RESULTADOS E NOTAS DOS BIMESTRES ANTERIORES */}
            {mainTab === "resultados" && (
                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-[600px] print:block print:h-auto">
                    {/* Sidebar 1: Classes */}
                    <div className="w-full md:w-60 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 shrink-0 overflow-y-auto custom-scrollbar print:hidden">
                        <h3 className="font-bold text-xs uppercase text-gray-400 mb-3 tracking-wider">1. Selecione a Turma</h3>
                        <div className="space-y-2">
                            {classes.map(cls => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClassId(cls.id)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                                        selectedClassId === cls.id 
                                            ? 'bg-vg-light border-vg-navy shadow-sm' 
                                            : 'bg-white border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <p className={`font-bold text-sm line-clamp-1 ${selectedClassId === cls.id ? 'text-vg-hover' : 'text-gray-700'}`}>
                                        {cls.name}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold text-gray-400">
                                        <Users size={12}/> {cls.students?.length || 0} alunos
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar 2: Archived Exams for Class */}
                    <div className={`w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 shrink-0 overflow-y-auto custom-scrollbar transition-opacity print:hidden ${!selectedClassId ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="font-bold text-xs uppercase text-gray-400 mb-3 tracking-wider">2. Avaliação ({selectedBimester})</h3>
                        <div className="space-y-2">
                            {examsForSelectedClass.length === 0 ? (
                                <p className="text-xs text-gray-400">Nenhuma avaliação arquivada para esta turma neste bimestre.</p>
                            ) : (
                                examsForSelectedClass.map(exam => (
                                    <button
                                        key={exam.id}
                                        onClick={() => setSelectedExamId(exam.id)}
                                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                                            selectedExamId === exam.id 
                                                ? 'bg-vg-light border-vg-navy shadow-sm' 
                                                : 'bg-white border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <p className={`font-bold text-xs line-clamp-2 ${selectedExamId === exam.id ? 'text-vg-hover' : 'text-gray-700'}`}>
                                            {exam.title || "Sem título"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5">
                                            {exam.bimester || "Anterior"}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Results View */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden print:overflow-visible print:border-none print:shadow-none print:block print:h-auto">
                        {selectedExam && selectedClassObj ? (
                            <>
                                <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 print:hidden">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800 line-clamp-1">{selectedExam.title}</h2>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className="bg-vg-navy text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                                                {selectedClassObj.name}
                                            </span>
                                            <span className="bg-vg-light text-vg-dark text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider">
                                                {selectedExam.bimester}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Ordem:</span>
                                                <select 
                                                    value={sortOrder} 
                                                    onChange={e => setSortOrder(e.target.value)}
                                                    className="bg-white border border-gray-200 text-xs py-1 px-2 rounded-md shadow-sm text-gray-600 font-semibold outline-none"
                                                >
                                                    <option value="alfabetica">Alfabética</option>
                                                    <option value="correcao">Correção</option>
                                                    <option value="maior">Maior Nota</option>
                                                    <option value="menor">Menor Nota</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Provas Corrigidas</p>
                                        <p className="text-2xl font-black text-vg-dark">
                                            {corrections.length} <span className="text-sm text-gray-400 font-medium">/ {selectedClassObj.students?.length || 0}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex border-b border-gray-100 px-6 bg-white shrink-0 print:hidden overflow-x-auto custom-scrollbar">
                                    <button
                                        onClick={() => setResultSubTab("cards")}
                                        className={`py-3.5 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap ${
                                            resultSubTab === "cards" 
                                                ? "border-vg-navy text-vg-dark" 
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        Visão por Cartões
                                    </button>
                                    <button
                                        onClick={() => setResultSubTab("summary")}
                                        className={`py-3.5 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                            resultSubTab === "summary" 
                                                ? "border-vg-navy text-vg-dark" 
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        <List size={15} />
                                        Resumo (Notas)
                                    </button>
                                    <button
                                        onClick={() => setResultSubTab("print")}
                                        className={`py-3.5 px-5 font-bold text-xs border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                            resultSubTab === "print" 
                                                ? "border-vg-navy text-vg-dark" 
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        <Printer size={15} />
                                        Boletins para Impressão
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar print:overflow-visible print:p-0 print:block print:h-auto">
                                    {resultSubTab === "cards" ? (
                                        corrections.length === 0 ? (
                                            <div className="py-16 flex flex-col items-center justify-center text-center">
                                                <Target size={48} className="text-gray-300 mb-4" />
                                                <h3 className="text-base font-bold text-gray-600 mb-1">Nenhuma correção registrada</h3>
                                                <p className="text-xs text-gray-400 max-w-sm">
                                                    Não há cartões corrigidos para a turma <b>{selectedClassObj.name}</b> nesta avaliação.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {sortedCorrections.map(corr => {
                                                    const hitRate = (corr.correctCount / corr.totalCount) * 100;
                                                    let gradeColor = "text-red-500";
                                                    if (hitRate >= 70) gradeColor = "text-green-500";
                                                    else if (hitRate >= 50) gradeColor = "text-yellow-500";

                                                    return (
                                                        <div 
                                                            key={corr.id} 
                                                            onClick={() => setSelectedStudent(corr)}
                                                            className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-vg-navy hover:shadow-md transition-all group"
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h3 className="font-bold text-sm text-gray-800 line-clamp-1 group-hover:text-vg-navy flex-1 pr-2">
                                                                    {corr.studentName}
                                                                </h3>
                                                                <div className={`text-xl font-black ${gradeColor}`}>
                                                                    {corr.score.toFixed(1)}
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden flex">
                                                                <div className="bg-green-500 h-2" style={{ width: `${hitRate}%` }}></div>
                                                            </div>
                                                            <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                                                                <span>{corr.correctCount} Acertos</span>
                                                                <span>{corr.totalCount} Questões</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )
                                    ) : resultSubTab === "summary" ? (
                                        <div className="space-y-6 print:space-y-0">
                                            <div className="flex justify-between items-center bg-vg-light/30 border border-vg-light/50 p-4 rounded-2xl print:hidden">
                                                <div>
                                                    <h3 className="font-bold text-vg-dark text-sm">Resumo de Notas ({selectedExam.bimester})</h3>
                                                    <p className="text-xs text-gray-600">Notas por disciplina e nota final de todos os alunos.</p>
                                                </div>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="btn btn-primary py-2.5 px-5 text-xs flex items-center gap-2 shadow-md"
                                                >
                                                    <Printer size={16} /> Imprimir Resumo
                                                </button>
                                            </div>
                                            
                                            <div className="print-container bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none">
                                                <div className="hidden print:block text-center mb-6">
                                                    <h2 className="text-xl font-bold text-vg-dark">Resumo de Notas: {selectedClassObj.name}</h2>
                                                    <p className="text-sm text-gray-500">{selectedExam.title}</p>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-gray-200 bg-gray-50">
                                                                <th className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider">Aluno</th>
                                                                {allSubjects.map(sub => (
                                                                    <th key={sub} className="py-3 px-4 font-bold text-gray-500 uppercase tracking-wider text-center">{sub}</th>
                                                                ))}
                                                                <th className="py-3 px-4 font-bold text-vg-dark uppercase tracking-wider text-center">Nota Geral</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-150">
                                                            {sortedCorrections.map((corr) => (
                                                                <tr key={corr.id} className="hover:bg-gray-50/50 print:break-inside-avoid">
                                                                    <td className="py-2 px-4 font-bold text-gray-700">{corr.studentName}</td>
                                                                    {allSubjects.map(sub => {
                                                                        const score = corr.scoresBySubject?.[sub];
                                                                        return (
                                                                            <td key={sub} className="py-2 px-4 text-center font-medium text-gray-600">
                                                                                {score !== undefined ? Number(score).toFixed(1) : "-"}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                    <td className="py-2 px-4 text-center font-black text-vg-dark">
                                                                        {corr.score.toFixed(1)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 print:space-y-0">
                                            <div className="flex justify-between items-center bg-vg-light/30 border border-vg-light/50 p-4 rounded-2xl print:hidden">
                                                <div>
                                                    <h3 className="font-bold text-vg-dark text-sm">Boletins para Impressão ({selectedExam.bimester})</h3>
                                                    <p className="text-xs text-gray-600">Relatórios individuais de desempenho prontos para impressão.</p>
                                                </div>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="btn btn-primary py-2.5 px-5 text-xs flex items-center gap-2 shadow-md"
                                                >
                                                    <Printer size={16} /> Imprimir Todos (PDF)
                                                </button>
                                            </div>

                                            <div className="print-container space-y-8 print:space-y-0 print:block print:h-auto">
                                                {corrections.length === 0 ? (
                                                    <p className="text-center text-gray-400 text-sm py-12">Nenhum boletim disponível para esta turma.</p>
                                                ) : (
                                                    sortedCorrections.map((corr, idx) => (
                                                        <div key={corr.id} className={`print-sheet bg-white p-8 border border-gray-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:m-0 print:p-0 print:break-inside-avoid ${idx !== 0 ? 'print:break-before-page' : ''}`}>
                                                            <div className="hidden print:flex border-b-2 border-vg-dark pb-2 mb-4 justify-between items-end">
                                                                <div>
                                                                    <h1 className="text-xl font-black text-vg-dark tracking-tight">{selectedClassObj.name} - {selectedExam.title}</h1>
                                                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">Boletim de Correção da Avaliação</p>
                                                                </div>
                                                                <div className="text-right flex items-center gap-2">
                                                                    <p className="text-[8px] uppercase font-bold text-gray-400 text-right">Provas<br/>Corrigidas</p>
                                                                    <p className="text-xl font-black text-vg-dark">{idx + 1} <span className="text-xs text-gray-400">/ {corrections.length}</span></p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:gap-2 mb-6 print:mb-4 text-sm print:text-xs bg-gray-50 p-4 print:p-2 rounded-xl border border-gray-100 print:flex print:flex-row print:justify-between print:w-full">
                                                                <div className="print:w-1/4">
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aluno</p>
                                                                    <p className="font-bold text-gray-800">{corr.studentName}</p>
                                                                </div>
                                                                <div className="print:w-1/4">
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Turma</p>
                                                                    <p className="font-bold text-gray-800">{selectedClassObj.name}</p>
                                                                </div>
                                                                <div className="print:w-1/4">
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avaliação</p>
                                                                    <p className="font-bold text-gray-800 line-clamp-1">{selectedExam.title}</p>
                                                                </div>
                                                                <div className="print:w-1/4">
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bimestre</p>
                                                                    <p className="font-bold text-gray-800">{selectedExam.bimester}</p>
                                                                </div>
                                                            </div>

                                                            <div className="mb-6 print:mb-4 p-4 print:p-2 bg-vg-light/10 border border-vg-light/30 rounded-xl">
                                                                <h3 className="text-xs print:text-[10px] font-bold text-vg-dark uppercase tracking-wider mb-3 print:mb-2">Notas por Componente Curricular</h3>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:gap-2">
                                                                    {corr.scoresBySubject && Object.entries(corr.scoresBySubject).map(([sub, score]) => (
                                                                        <div key={sub} className="bg-white p-3 print:p-1.5 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                                                                            <span className="font-bold text-xs print:text-[10px] text-gray-700">{sub}</span>
                                                                            <span className="font-black text-sm print:text-xs text-vg-dark">{Number(score).toFixed(1)} <span className="text-[10px] print:text-[8px] text-gray-400 font-normal">/ 2.0</span></span>
                                                                        </div>
                                                                    ))}
                                                                    <div className="bg-white p-3 print:p-1.5 rounded-lg border-2 border-vg-dark flex justify-between items-center shadow-sm sm:col-span-3">
                                                                        <span className="font-bold text-xs print:text-[10px] text-vg-dark font-black">SOMA DAS NOTAS (NOTA FINAL):</span>
                                                                        <span className="font-black text-base print:text-sm text-vg-dark">{corr.score.toFixed(1)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 font-medium p-12 text-center">
                                <Search size={40} className="text-gray-200 mb-4" />
                                <p>Selecione uma turma e uma avaliação anterior para consultar os resultados arquivados.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.studentName}</h2>
                                <p className="text-sm font-medium text-gray-500">Raio-X de Desempenho ({selectedExam?.bimester})</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase font-bold text-gray-400">Nota Final</p>
                                <p className="text-3xl font-black text-vg-dark">{selectedStudent.score.toFixed(1)}</p>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {selectedStudent.scoresBySubject && (
                                <div className="mb-6 p-4 bg-vg-light/30 rounded-2xl border border-vg-light/50">
                                    <h4 className="text-xs font-bold text-vg-dark uppercase tracking-wider mb-3">Notas por Componente Curricular:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {Object.entries(selectedStudent.scoresBySubject).map(([sub, score]) => {
                                            const numericScore = Number(score) || 0;
                                            let scoreColor = "text-red-600";
                                            if (numericScore >= 1.4) scoreColor = "text-green-600";
                                            else if (numericScore >= 1.0) scoreColor = "text-yellow-600";
                                            
                                            return (
                                                <div key={sub} className="bg-white p-3.5 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                                                    <span className="font-bold text-xs text-gray-700">{sub}</span>
                                                    <span className={`font-black text-sm ${scoreColor}`}>{numericScore.toFixed(1)} <span className="text-[10px] text-gray-400 font-normal">/ 2.0</span></span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <h3 className="font-bold text-sm uppercase text-gray-400 mb-4 tracking-wider">Mapeamento por Questão (BNCC)</h3>
                            <div className="space-y-3">
                                {selectedStudent.details?.map((detail, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 ${detail.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white shadow-sm font-bold text-gray-700">
                                            {detail.questionIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">{detail.subject}</p>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${detail.habilidade !== 'N/A' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                {detail.habilidade}
                                            </span>
                                        </div>
                                        <div className="text-right shrink-0 flex flex-col items-end">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Marcou:</span>
                                                <span className="font-bold text-sm">{detail.studentAnswer || "-"}</span>
                                            </div>
                                            {detail.isCorrect ? (
                                                <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={14}/> Acertou</span>
                                            ) : (
                                                <span className="text-xs font-bold text-red-500 flex items-center gap-1"><XCircle size={14}/> Errou (Correta: {detail.correctAnswer})</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 shrink-0">
                            <button onClick={() => setSelectedStudent(null)} className="btn btn-primary w-full py-3">
                                Fechar Raio-X
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
