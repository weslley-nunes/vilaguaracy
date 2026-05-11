"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, ChevronLeft, CheckCircle2, Info, BookOpen, User, Calendar } from "lucide-react";
import Link from "next/link";

export default function GabaritoPublicoPage() {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            loadExam(id);
        }
    }, [id]);

    const loadExam = async (examId) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/exams/get?id=${examId}`);
            if (!res.ok) throw new Error("Gabarito não encontrado. Verifique o código.");
            const data = await res.json();
            setExam(data.exam);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 size={48} className="animate-spin text-vg-dark mb-4" />
                <p className="text-gray-500 font-medium">Buscando gabarito oficial...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-red-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <Link href="/" className="btn btn-primary w-full py-3">
                        Tentar outro código
                    </Link>
                </div>
            </div>
        );
    }

    const multipleChoiceQuestions = exam.questions?.filter(q => q.type === 'multiple_choice') || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Banner */}
            <div className="bg-vg-dark text-white pt-10 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors">
                        <ChevronLeft size={20} />
                        <span className="font-medium">Voltar ao Início</span>
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest">Gabarito Oficial</span>
                                <span className="bg-vg-navy text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest">Cód: {exam.id.slice(-6).toUpperCase()}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black">{exam.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 mt-4 text-white/80 text-sm">
                                <div className="flex items-center gap-2"><User size={16} /> {exam.teacherName}</div>
                                <div className="flex items-center gap-2"><BookOpen size={16} /> {exam.bimester || "Geral"}</div>
                                <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(exam.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('pt-BR')}</div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
                            <p className="text-[10px] uppercase font-bold text-white/60 mb-1">Total de Questões</p>
                            <p className="text-3xl font-black">{exam.questions?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-10">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                        <CheckCircle2 size={24} className="text-green-500" />
                        <h2 className="text-xl font-bold text-gray-800">Respostas Corretas</h2>
                    </div>

                    <div className="p-8">
                        {multipleChoiceQuestions.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {multipleChoiceQuestions.map((q, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-vg-navy hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-vg-navy group-hover:text-white transition-colors">
                                                {idx + 1}
                                            </div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400">{q.subject || "Questão"}</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-black shadow-sm">
                                            {q.correct || "-"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-gray-400 font-medium">Esta prova não possui questões de múltipla escolha.</p>
                            </div>
                        )}

                        <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                            <Info className="text-blue-500 shrink-0 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-800 text-sm mb-1">Informação para o Estudante</h4>
                                <p className="text-blue-700/80 text-xs leading-relaxed">
                                    Este é o gabarito oficial gerado pelo sistema Vila Guaracy. Se você tiver dúvidas sobre alguma questão, procure o seu professor para orientações pedagógicas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-gray-400 text-xs">© 2026 Escola Estadual Vila Guaracy • Sistema de Avaliação Inteligente</p>
                </div>
            </div>
        </div>
    );
}
