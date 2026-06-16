"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, Search, Target, Users, BookOpen, CheckCircle, XCircle, Printer, List } from "lucide-react";
import Link from "next/link";
import { ExamService } from "@/services/examService";
import { useAuth } from "@/context/AuthContext";
import { getClassesByUser } from "@/services/classesService";

export default function ResultadosPage() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [corrections, setCorrections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null); // Modal state
    const [activeTab, setActiveTab] = useState("cards"); // "cards" | "print" | "summary"
    const [sortOrder, setSortOrder] = useState("alfabetica"); // "correcao" | "maior" | "menor" | "alfabetica"

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Check if user is coordinator or gestao
            const isCoordinator = user?.role === "gestao" || user?.role === "coordenador";
            
            // Load exams and classes
            const [examList, classList] = await Promise.all([
                isCoordinator ? ExamService.listAll() : ExamService.listByTeacher(user?.uid),
                getClassesByUser()
            ]);
            
            // Filter classes client-side: coordinators see all, teachers only see their own
            const filteredClassList = isCoordinator
                ? classList
                : classList.filter(cls => cls.userId === user?.uid);

            setExams(examList);
            setClasses(filteredClassList);
            
            // Read query parameters for class and exam selection
            const urlParams = new URLSearchParams(window.location.search);
            const qExamId = urlParams.get("examId");
            const qClassId = urlParams.get("classId");
            
            let classIdToSelect = filteredClassList.length > 0 ? filteredClassList[0].id : "";
            if (qClassId) {
                const matchedClass = filteredClassList.find(c => c.id === qClassId || c.name === qClassId);
                if (matchedClass) {
                    classIdToSelect = matchedClass.id;
                }
            }
            setSelectedClassId(classIdToSelect);

            if (qExamId) {
                const matchedExam = examList.find(e => e.id === qExamId || e.shortId === qExamId);
                if (matchedExam) {
                    setSelectedExamId(matchedExam.id);
                }
            }
        } catch (error) {
            console.error("Error loading exams:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-select student if studentName is passed in query parameters
    useEffect(() => {
        if (corrections.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const qStudentName = urlParams.get("studentName");
            if (qStudentName) {
                const decodedStudentName = decodeURIComponent(qStudentName).trim().toLowerCase();
                const matchedCorr = corrections.find(c => c.studentName?.trim().toLowerCase() === decodedStudentName);
                if (matchedCorr) {
                    setSelectedStudent(matchedCorr);
                    
                    // Clean query parameters from URL to avoid reopen on navigation/refresh
                    const cleanUrl = window.location.pathname;
                    window.history.replaceState({}, "", cleanUrl);
                }
            }
        }
    }, [corrections]);

    // Load corrections when selected exam or class changes
    useEffect(() => {
        if (!selectedExamId || !selectedClassId) return;
        
        const fetchCorrections = async () => {
            try {
                const results = await ExamService.listCorrectionsByExam(selectedExamId);
                const selectedClass = classes.find(c => c.id === selectedClassId);
                
                // Filtra as correções da turma selecionada (comparando o nome ou ID)
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

    // Auto-select the first exam of the selected class when selectedClassId changes
    useEffect(() => {
        if (!selectedClassId || exams.length === 0 || classes.length === 0) return;
        
        const selectedClass = classes.find(c => c.id === selectedClassId);
        const filtered = exams.filter(exam => {
            if (exam.classId === selectedClassId) return true;
            if (selectedClass && exam.className === selectedClass.name) return true;
            if (selectedClass && exam.title?.includes(selectedClass.name)) return true;
            return false;
        });

        // Check if query parameter has a specific exam to select
        const urlParams = new URLSearchParams(window.location.search);
        const qExamId = urlParams.get("examId");

        if (qExamId) {
            const matchedExam = filtered.find(e => e.id === qExamId || e.shortId === qExamId);
            if (matchedExam) {
                setSelectedExamId(matchedExam.id);
                return;
            }
        }

        // If the current selected exam is in the filtered list, keep it.
        // Otherwise, auto-select the first exam.
        if (filtered.length > 0) {
            if (!filtered.some(e => e.id === selectedExamId)) {
                setSelectedExamId(filtered[0].id);
            }
        } else {
            setSelectedExamId("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId, exams, classes]);

    const selectedClassObj = classes.find(c => c.id === selectedClassId);

    // Filter exams to only show those that belong to the selected class
    const examsForSelectedClass = exams.filter(exam => {
        if (!selectedClassId) return false;
        if (exam.classId === selectedClassId) return true;
        if (selectedClassObj && exam.className === selectedClassObj.name) return true;
        if (selectedClassObj && exam.title?.includes(selectedClassObj.name)) return true;
        return false;
    });

    const selectedExam = examsForSelectedClass.find(e => e.id === selectedExamId);
    
    // Calcula todas as disciplinas únicas presentes nas correções desta turma
    const allSubjects = Array.from(new Set(corrections.flatMap(c => Object.keys(c.scoresBySubject || {})))).sort();

    // Sorting logic
    const sortedCorrections = [...corrections].sort((a, b) => {
        if (sortOrder === "maior") return b.score - a.score;
        if (sortOrder === "menor") return a.score - b.score;
        if (sortOrder === "alfabetica") return (a.studentName || "").localeCompare(b.studentName || "");
        // "correcao" is default
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
    });

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col print:max-w-full print:w-full print:h-auto print:block">
            <div className="flex items-center gap-4 mb-8 shrink-0 print:hidden">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-vg-dark">Resultados das Avaliações</h1>
                    <p className="text-sm text-gray-500">Acompanhe o desempenho das turmas e o raio-x por aluno.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 size={40} className="animate-spin text-vg-navy mb-4" />
                    <p className="text-gray-500 font-medium">Carregando dados...</p>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 print:block print:h-auto">
                    {/* Sidebar 1: Classes */}
                    <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 shrink-0 overflow-y-auto custom-scrollbar print:hidden">
                        <h3 className="font-bold text-sm uppercase text-gray-400 mb-4 tracking-wider">1. Selecione a Turma</h3>
                        <div className="space-y-2">
                            {classes.length === 0 ? (
                                <p className="text-sm text-gray-400">Nenhuma turma encontrada.</p>
                            ) : (
                                classes.map(cls => (
                                    <button
                                        key={cls.id}
                                        onClick={() => setSelectedClassId(cls.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            selectedClassId === cls.id 
                                                ? 'bg-vg-light border-vg-navy shadow-sm' 
                                                : 'bg-white border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <p className={`font-bold text-sm line-clamp-2 ${selectedClassId === cls.id ? 'text-vg-hover' : 'text-gray-700'}`}>
                                            {cls.name}
                                        </p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] uppercase font-bold text-gray-400">
                                            <Users size={12}/> {cls.students?.length || 0} alunos
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar 2: Exams */}
                    <div className={`w-full md:w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 shrink-0 overflow-y-auto custom-scrollbar transition-opacity print:hidden ${!selectedClassId ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h3 className="font-bold text-sm uppercase text-gray-400 mb-4 tracking-wider">2. Avaliação</h3>
                        <div className="space-y-2">
                            {examsForSelectedClass.length === 0 ? (
                                <p className="text-sm text-gray-400">Nenhuma avaliação encontrada para esta turma.</p>
                            ) : (
                                examsForSelectedClass.map(exam => (
                                    <button
                                        key={exam.id}
                                        onClick={() => setSelectedExamId(exam.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            selectedExamId === exam.id 
                                                ? 'bg-vg-light border-vg-navy shadow-sm' 
                                                : 'bg-white border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <p className={`font-bold text-sm line-clamp-2 ${selectedExamId === exam.id ? 'text-vg-hover' : 'text-gray-700'}`}>
                                            {exam.title || "Sem título"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">
                                            {exam.bimester || "Geral"}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main View: Class Results */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden print:overflow-visible print:border-none print:shadow-none print:block print:h-auto">
                        {selectedExam && selectedClassObj ? (
                            <>
                                <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0 print:hidden">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 line-clamp-1">{selectedExam.title}</h2>
                                        <div className="flex flex-wrap items-center gap-3 mt-2">
                                            <span className="bg-vg-navy text-white text-[10px] px-2 py-1.5 rounded font-bold uppercase tracking-wider">
                                                {selectedClassObj.name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500 uppercase">Ordem:</span>
                                                <select 
                                                    value={sortOrder} 
                                                    onChange={e => setSortOrder(e.target.value)}
                                                    className="input bg-white border-gray-200 text-xs py-1 px-2 w-auto rounded-md shadow-sm text-gray-600 font-semibold focus:ring-vg-navy"
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
                                        <p className="text-2xl font-black text-vg-dark">{corrections.length} <span className="text-sm text-gray-400 font-medium">/ {selectedClassObj.students?.length || 0}</span></p>
                                    </div>
                                </div>

                                <div className="flex border-b border-gray-100 px-6 bg-white shrink-0 print:hidden overflow-x-auto custom-scrollbar">
                                    <button
                                        onClick={() => setActiveTab("cards")}
                                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                                            activeTab === "cards" 
                                                ? "border-vg-navy border-b-vg-navy text-vg-dark" 
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        Visão por Cartões
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("print")}
                                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                            activeTab === "print" 
                                                ? "border-vg-navy border-b-vg-navy text-vg-dark" 
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        <Printer size={16} />
                                        Boletins para Impressão
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("summary")}
                                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                                            activeTab === "summary" 
                                                ? "border-vg-navy border-b-vg-navy text-vg-dark" 
                                                : "border-transparent text-gray-400 hover:text-gray-600"
                                        }`}
                                    >
                                        <List size={16} />
                                        Resumo (Notas)
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar print:overflow-visible print:p-0 print:block print:h-auto">
                                    {activeTab === "cards" ? (
                                        corrections.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center">
                                                <Target size={48} className="text-gray-300 mb-4" />
                                                <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma correção nesta turma</h3>
                                                <p className="text-sm text-gray-400 max-w-sm">
                                                    Nenhum aluno da turma <b>{selectedClassObj.name}</b> teve seu cartão-resposta lido no <Link href="/scanner" className="text-vg-navy font-bold hover:underline">Scanner</Link> para esta avaliação.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col h-full">
                                                <div className="mb-6 shrink-0">
                                                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Desempenho dos Alunos</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
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
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="flex-1">
                                                                    <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-vg-navy">{corr.studentName}</h3>
                                                                </div>
                                                                <div className={`text-2xl font-black ${gradeColor}`}>
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
                                                    )
                                                })}
                                                </div>
                                            </div>
                                        )
                                    ) : activeTab === "summary" ? (
                                        <div className="space-y-6 print:space-y-0">
                                            <div className="flex justify-between items-center bg-vg-light/30 border border-vg-light/50 p-6 rounded-2xl print:hidden shadow-sm">
                                                <div>
                                                    <h3 className="font-bold text-vg-dark text-base">Resumo de Notas</h3>
                                                    <p className="text-xs text-gray-600 mt-1">Visão geral das notas por disciplina e nota final de todos os alunos.</p>
                                                </div>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="btn btn-primary py-3 px-6 text-sm flex items-center gap-2 shadow-lg shadow-vg-dark/20"
                                                >
                                                    <Printer size={18} />
                                                    Imprimir Resumo
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
                                                            {sortedCorrections.map((corr, idx) => (
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
                                            <div className="flex justify-between items-center bg-vg-light/30 border border-vg-light/50 p-6 rounded-2xl print:hidden shadow-sm">
                                                <div>
                                                    <h3 className="font-bold text-vg-dark text-base">Gerador de Boletins para Impressão</h3>
                                                    <p className="text-xs text-gray-600 mt-1">Gere relatórios de desempenho individuais de todos os alunos prontos para impressão física ou salvar como PDF.</p>
                                                </div>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="btn btn-primary py-3 px-6 text-sm flex items-center gap-2 shadow-lg shadow-vg-dark/20"
                                                >
                                                    <Printer size={18} />
                                                    Imprimir Todos (PDF)
                                                </button>
                                            </div>

                                            <div className="print-container space-y-8 print:space-y-0 print:block print:h-auto">
                                                {corrections.length === 0 ? (
                                                    <p className="text-center text-gray-400 text-sm py-12">Nenhum boletim disponível para esta turma.</p>
                                                ) : (
                                                    sortedCorrections.map((corr, idx) => (
                                                        <div key={corr.id} className={`print-sheet bg-white p-8 border border-gray-200 rounded-2xl shadow-sm print:shadow-none print:border-none print:m-0 print:p-0 print:break-inside-avoid ${idx !== 0 ? 'print:break-before-page' : ''}`}>
                                                            {/* Header in Print Mode */}
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

                                                            {/* Student & Exam Info */}
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
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Data da Prova</p>
                                                                    <p className="font-bold text-gray-800">
                                                                        {corr.correctedAt?.seconds 
                                                                            ? new Date(corr.correctedAt.seconds * 1000).toLocaleDateString('pt-BR') 
                                                                            : corr.correctedAt
                                                                                ? new Date(corr.correctedAt).toLocaleDateString('pt-BR') 
                                                                                : new Date().toLocaleDateString('pt-BR')}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Component Scores */}
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

                                                            {/* Details Table */}
                                                            <div className="mb-8 print:mb-2">
                                                                <h3 className="text-xs print:text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-3 print:mb-1">Detalhamento por Questão (BNCC / Erros e Acertos)</h3>
                                                                <div className="grid grid-cols-1 print:flex print:flex-row print:justify-between print:w-full gap-4 print:gap-2">
                                                                    {[
                                                                        corr.details?.slice(0, Math.ceil((corr.details?.length || 0) / 2)),
                                                                        corr.details?.slice(Math.ceil((corr.details?.length || 0) / 2))
                                                                    ].filter(half => half && half.length > 0).map((half, hIdx) => (
                                                                        <div key={hIdx} className="border border-gray-200 rounded-xl overflow-hidden print:rounded-none print:border-t print:border-b print:border-l-0 print:border-r-0 print:w-[49%]">
                                                                            <table className="w-full text-left text-xs border-collapse">
                                                                                <thead>
                                                                                    <tr className="border-b border-gray-200 bg-gray-50 print:text-[8px]">
                                                                                        <th className="py-2.5 px-2 print:py-1 print:px-1 font-bold text-gray-500 uppercase tracking-wider w-8">Q.</th>
                                                                                        <th className="py-2.5 px-2 print:py-1 print:px-1 font-bold text-gray-500 uppercase tracking-wider">Comp.</th>
                                                                                        <th className="py-2.5 px-2 print:py-1 print:px-1 font-bold text-gray-500 uppercase tracking-wider">Habilidade</th>
                                                                                        <th className="py-2.5 px-2 print:py-1 print:px-1 font-bold text-gray-500 uppercase tracking-wider text-center w-10">Mar.</th>
                                                                                        <th className="py-2.5 px-2 print:py-1 print:px-1 font-bold text-gray-500 uppercase tracking-wider text-center w-10">Gab.</th>
                                                                                        <th className="py-2.5 px-2 print:py-1 print:px-1 font-bold text-gray-500 uppercase tracking-wider text-center w-10">Status</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-gray-150 print:text-[8px]">
                                                                                    {half.map((detail, idx) => (
                                                                                        <tr key={idx} className="hover:bg-gray-50/50 print:py-0">
                                                                                            <td className="py-2 px-2 print:py-0 print:px-1 font-bold text-gray-700 text-center">{detail.questionIndex !== undefined ? detail.questionIndex + 1 : (detail.q !== undefined ? detail.q : "-")}</td>
                                                                                            <td className="py-2 px-2 print:py-0 print:px-1 text-gray-600 font-semibold truncate max-w-[50px]">{detail.subject || "Geral"}</td>
                                                                                            <td className="py-2 px-2 print:py-0 print:px-1">
                                                                                                <span className="bg-gray-100 text-gray-700 px-1 py-0 rounded text-[9px] print:text-[7px] font-bold tracking-wider uppercase border border-gray-200 print:border-none print:bg-transparent print:p-0">
                                                                                                    {detail.habilidade || detail.skill || "N/A"}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="py-2 px-2 print:py-0 print:px-1 text-center font-bold text-gray-700">{detail.studentAnswer || detail.marked || "-"}</td>
                                                                                            <td className="py-2 px-2 print:py-0 print:px-1 text-center font-bold text-green-600">{detail.correctAnswer || detail.correct || "-"}</td>
                                                                                            <td className="py-2 px-2 print:py-0 print:px-1 text-center">
                                                                                                {detail.isCorrect ? (
                                                                                                    <span className="text-green-600 font-black">Acertou</span>
                                                                                                ) : (
                                                                                                    <span className="text-red-500 font-black">Errou</span>
                                                                                                )}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    ))}
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
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 font-medium">
                                <Search size={40} className="text-gray-200 mb-4" />
                                <p>Selecione uma turma e uma avaliação para ver os resultados.</p>
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
                                <p className="text-sm font-medium text-gray-500">Raio-X de Desempenho e Habilidades</p>
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
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${detail.habilidade !== 'N/A' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                                    {detail.habilidade}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 flex flex-col items-end">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Marcou:</span>
                                                <span className="font-bold text-sm">{detail.studentAnswer || "-"}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {detail.isCorrect ? (
                                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={14}/> Acertou</span>
                                                ) : (
                                                    <span className="text-xs font-bold text-red-500 flex items-center gap-1"><XCircle size={14}/> Errou (Correta: {detail.correctAnswer})</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 shrink-0">
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="btn btn-primary w-full py-3"
                            >
                                Fechar Raio-X
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    aside, nav, header, footer, button, .print\\:hidden, .sidebar, .navbar {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        background-image: none !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    main, .flex-1, .max-w-6xl {
                        max-width: 100% !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    .print-container {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .print-sheet {
                        page-break-after: always !important;
                        break-after: page !important;
                        margin: 0 !important;
                        padding: 1cm !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        height: 297mm;
                        box-sizing: border-box;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: flex-start !important;
                    }
                    .bg-gray-50, .bg-gray-100 {
                        background-color: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .bg-vg-light\\/10 {
                        background-color: rgba(14, 74, 45, 0.05) !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .text-green-600 {
                        color: #059669 !important;
                    }
                    .text-red-500 {
                        color: #ef4444 !important;
                    }
                }
            ` }} />
        </div>
    );
}
