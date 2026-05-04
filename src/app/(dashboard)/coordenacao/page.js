"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ExamService } from "@/services/examService";
import { 
    BarChart2, 
    Users, 
    Calendar, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    AlertTriangle, 
    Loader2, 
    Search,
    Filter
} from "lucide-react";

export default function CoordenacaoPage() {
    const { user, activeRole } = useAuth();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterBimester, setFilterBimester] = useState("Todos");

    useEffect(() => {
        if (user && (activeRole === 'gestao' || activeRole === 'coordenador')) {
            loadExams();
        }
    }, [user, activeRole]);

    const loadExams = async () => {
        setLoading(true);
        try {
            // Fetch all exams for coordination view
            const data = await ExamService.listAll(); 
            // Filter only collaborative exams or those with templates (even if 0 questions)
            setExams(data.filter(e => (e.collaborators && e.collaborators.length > 0) || e.templateType || e.questions?.length > 0));
        } catch (error) {
            console.error("Error loading exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBimester = filterBimester === "Todos" || exam.bimester === filterBimester;
        return matchesSearch && matchesBimester;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-vg-dark" size={48} />
                <p className="text-gray-500 font-medium">Carregando progresso das avaliações...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                        <BarChart2 className="text-vg-dark" size={32} />
                        Monitoramento de Progresso
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Acompanhe em tempo real se os professores completaram suas cotas de questões.
                    </p>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar prova..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border-none outline-none text-sm w-64 focus:ring-2 focus:ring-vg-dark"
                        />
                    </div>
                    <select 
                        value={filterBimester}
                        onChange={(e) => setFilterBimester(e.target.value)}
                        className="bg-gray-50 dark:bg-black/20 py-2 px-4 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-vg-dark cursor-pointer"
                    >
                        <option>Todos</option>
                        <option>1º Bimestre</option>
                        <option>2º Bimestre</option>
                        <option>3º Bimestre</option>
                        <option>4º Bimestre</option>
                    </select>
                </div>
            </header>

            {filteredExams.length === 0 ? (
                <div className="bg-white dark:bg-white/5 rounded-3xl p-20 border-2 border-dashed border-gray-100 dark:border-white/10 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                        <AlertTriangle size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhuma avaliação colaborativa encontrada</h3>
                    <p className="text-gray-500 mt-2">As provas aparecerão aqui quando possuírem colaboradores ou modelos multidisciplinares.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredExams.map((exam) => (
                        <ExamProgressCard key={exam.id} exam={exam} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ExamProgressCard({ exam }) {
    const totalQuestions = exam.questions?.length || 0;
    
    // We determine blocks based on collaborators OR if it was a template with subjects
    let blocks = [];
    
    if (exam.collaborators && exam.collaborators.length > 0) {
        blocks = exam.collaborators.map(c => {
            const current = exam.questions?.filter(q => q.ownerId === c.userId).length || 0;
            return {
                name: c.name,
                subject: c.subject,
                quota: c.quota,
                current: current,
                isComplete: current >= c.quota
            };
        });
    } else if (exam.templateType) {
        // Fallback for template-based exams where the creator did everything or it's yet to be assigned
        // In the current logic, generateFromTemplate sets subject for all.
        // Let's identify unique subjects
        const subjects = [...new Set(exam.questions?.map(q => q.subject))];
        blocks = subjects.map(s => {
            const current = exam.questions?.filter(q => q.subject === s).length || 0;
            // For templates, we don't strictly have a quota saved per subject in the exam object yet
            // but we know them from the EXAM_TEMPLATES. For monitoring, we just show what's there.
            return {
                name: exam.teacherName || "Professor",
                subject: s,
                quota: "N/A",
                current: current,
                isComplete: current > 0
            };
        });
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-vg-light text-vg-hover px-2 py-1 rounded-full mb-2 inline-block">
                            {exam.bimester || "Geral"}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-1 group-hover:text-vg-dark transition-colors">
                            {exam.title}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-vg-dark">{totalQuestions}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Questões</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} /> Status dos Blocos
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {blocks.map((block, idx) => (
                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${block.isComplete ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/20' : 'bg-rose-50 border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/20'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${block.isComplete ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    {block.isComplete ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{block.subject}</p>
                                    <p className="text-[10px] text-gray-500 font-medium truncate">{block.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${block.isComplete ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {block.current} <span className="text-[10px] text-gray-400 font-bold">/ {block.quota}</span>
                                    </p>
                                    <p className="text-[9px] font-bold uppercase text-gray-400">{block.isComplete ? 'Concluído' : 'Pendente'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-white/5 p-4 border-t border-gray-100 dark:border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={14} />
                    <span>Criada em {new Date(exam.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                </div>
                <button className="text-xs font-bold text-vg-dark hover:underline flex items-center gap-1">
                    <FileText size={14} /> Ver Detalhes
                </button>
            </div>
        </div>
    );
}
