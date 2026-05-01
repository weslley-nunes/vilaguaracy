"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ExamService } from "@/services/examService";
import { FileText, Loader2, Trash2, Edit, Printer, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyExamsPage() {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            loadExams();
        }
    }, [user]);

    const loadExams = async () => {
        setLoading(true);
        try {
            const data = await ExamService.listByTeacher(user.uid);
            setExams(data);
        } catch (error) {
            console.error("Error loading exams:", error);
            alert("Erro ao carregar avaliações.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
        try {
            await ExamService.delete(id);
            setExams(exams.filter(e => e.id !== id));
        } catch (error) {
            alert("Erro ao excluir.");
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-vg-dark" size={40} /></div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Avaliações</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie todas as suas provas criadas.</p>
                </div>
                <Link href="/builder" className="btn btn-primary flex items-center gap-2">
                    <FileText size={20} /> Nova Avaliação
                </Link>
            </div>

            {exams.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10">
                    <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Nenhuma avaliação encontrada</h3>
                    <p className="text-gray-500 mb-6">Comece criando sua primeira prova agora mesmo.</p>
                    <Link href="/builder" className="btn btn-primary">Criar Agora</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.map((exam) => (
                        <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2 line-clamp-1">{exam.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    <span className="flex items-center gap-1"><FileText size={14} /> {exam.questions?.length || 0} Questões</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(exam.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-4 mt-2">
                                    <button onClick={() => handleDelete(exam.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Excluir">
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="flex gap-2">
                                        {/* TODO: Implement Edit/View Logic. For now just standard print view or load into builder? */}
                                        {/* Loading into builder would require handling 'edit mode' in builder page. Future task. */}
                                        <button className="text-vg-dark dark:text-vg-navy hover:bg-vg-light dark:hover:bg-vg-navy/20 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                                            Ver / Imprimir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
