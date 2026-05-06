"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, Search, Target, Users, BookOpen, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { ExamService } from "@/services/examService";
import { useAuth } from "@/context/AuthContext";

export default function ResultadosPage() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [corrections, setCorrections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedExamId, setSelectedExamId] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null); // Modal state

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load exams
            const examList = await ExamService.listExams(user?.uid, user?.role);
            setExams(examList);
            
            if (examList.length > 0) {
                setSelectedExamId(examList[0].id);
            }
        } catch (error) {
            console.error("Error loading exams:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load corrections when selected exam changes
    useEffect(() => {
        if (!selectedExamId) return;
        
        const fetchCorrections = async () => {
            try {
                const res = await fetch(`/api/corrections/list?examId=${selectedExamId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCorrections(data.corrections);
                }
            } catch (e) {
                console.error("Failed to load corrections");
            }
        };
        fetchCorrections();
    }, [selectedExamId]);

    const selectedExam = exams.find(e => e.id === selectedExamId);

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex items-center gap-4 mb-8 shrink-0">
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
                <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                    {/* Sidebar: Filters */}
                    <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 shrink-0 overflow-y-auto">
                        <h3 className="font-bold text-sm uppercase text-gray-400 mb-4 tracking-wider">Selecione a Avaliação</h3>
                        <div className="space-y-2">
                            {exams.map(exam => (
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
                                        {exam.title || "Avaliação sem título"}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <BookOpen size={12}/> {exam.questions?.length || 0}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Users size={12}/> {exam.bimester || "Geral"}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main View: Class Results */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        {selectedExam ? (
                            <>
                                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{selectedExam.title}</h2>
                                        <p className="text-sm text-gray-500 font-medium mt-1">
                                            Total de Correções Lançadas: <span className="font-bold text-vg-dark">{corrections.length}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                    {corrections.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <Target size={48} className="text-gray-300 mb-4" />
                                            <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma correção lançada</h3>
                                            <p className="text-sm text-gray-400 max-w-sm">
                                                Vá até o <Link href="/scanner" className="text-vg-navy font-bold hover:underline">Scanner</Link> e leia os cartões-resposta para popular este painel.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {corrections.map(corr => {
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
                                                                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Turma: {corr.classId}</p>
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
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                                Selecione uma avaliação na lista lateral
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
        </div>
    );
}
