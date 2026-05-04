"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FileText, Users, Plus, Loader2, AlertCircle } from "lucide-react";
import { getClassesByUser } from "@/services/classesService";
import { ExamService } from "@/services/examService";

export default function Dashboard() {
    const { user, activeRole } = useAuth();

    const [stats, setStats] = useState({ examsCount: 0, studentsCount: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadStats = async () => {
            setIsLoading(true);
            try {
                // If coordinator or management, we want to see the global stats
                const isManagement = activeRole === 'gestao' || activeRole === 'coordenador';
                console.log("Dashboard: Loading stats for role:", activeRole, "isManagement:", isManagement);
                
                // Fetch exams and classes concurrently
                const [exams, classes] = await Promise.all([
                    isManagement ? ExamService.listAll() : ExamService.listByTeacher(user.uid),
                    getClassesByUser(user.uid)
                ]);

                console.log("Dashboard: Exams fetched:", exams.length);

                // Calculate total students
                let totalStudents = 0;
                classes.forEach(c => {
                    if (c.students && Array.isArray(c.students)) {
                        totalStudents += c.students.length;
                    }
                });

                // Find pending exams for teacher role
                let pendingExams = [];
                if (!isManagement) {
                    pendingExams = exams.filter(exam => {
                        if (!exam.collaborators) return false;
                        const myBlock = exam.collaborators.find(c => c.userId === user.uid);
                        return myBlock && (myBlock.current < myBlock.quota);
                    });
                }

                setStats({
                    examsCount: exams.length,
                    studentsCount: totalStudents,
                    pendingExams: pendingExams
                });
            } catch (error) {
                console.error("Erro ao carregar estatísticas do dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [user, activeRole]);

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {user?.displayName?.split(" ")[0] || 'Professor'}! 👋</h1>
                <p className="text-gray-500 dark:text-gray-400">Aqui está o resumo das suas atividades.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="card flex items-center gap-4 border-l-4 border-vg-dark bg-white dark:bg-white/5 p-4 rounded-lg shadow-sm">
                    <div className="p-3 bg-vg-light dark:bg-vg-dark/20 rounded-full text-vg-dark dark:text-vg-navy">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Avaliações Criadas</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {isLoading ? <Loader2 size={20} className="animate-spin text-vg-navy" /> : stats.examsCount}
                        </p>
                    </div>
                </div>

                <div className="card flex items-center gap-4 border-l-4 border-teal-500 bg-white dark:bg-white/5 p-4 rounded-lg shadow-sm">
                    <div className="p-3 bg-teal-50 dark:bg-teal-500/20 rounded-full text-teal-600 dark:text-teal-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Alunos Cadastrados</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {isLoading ? <Loader2 size={20} className="animate-spin text-teal-400" /> : stats.studentsCount}
                        </p>
                    </div>
                </div>
            </div>

            {/* Pending Collaborative Blocks for Teachers */}
            {!isLoading && stats.pendingExams?.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="text-rose-500" size={20} /> Pendências de Blocos (Multidisciplinar)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.pendingExams.map(exam => {
                            const myBlock = exam.collaborators.find(c => c.userId === user.uid);
                            return (
                                <div key={exam.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-rose-100 dark:border-rose-500/20 p-5 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Pendente: {myBlock?.subject}</p>
                                            <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1">{exam.title}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-rose-600">{myBlock?.current} <span className="text-xs text-gray-400">/ {myBlock?.quota}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 gap-4">
                                        <div className="flex-1 bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-rose-500 h-full transition-all duration-500" 
                                                style={{ width: `${Math.min(100, (myBlock?.current / myBlock?.quota) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <Link 
                                            href={`/builder?id=${exam.id}`}
                                            className="btn btn-primary py-1.5 px-4 text-xs flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <Plus size={14} /> Enviar Questões
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/builder" className="group p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-md transition-all hover:border-vg-navy dark:hover:border-vg-dark flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-vg-light dark:bg-vg-dark/20 text-vg-dark dark:text-vg-navy rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Nova Avaliação</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Crie uma prova do zero ou com IA</p>
                </Link>

                <Link href="/classes" className="group p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-md transition-all hover:border-teal-300 dark:hover:border-teal-500 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Gerenciar Turmas</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cadastre alunos e gere QR Codes</p>
                </Link>
            </div>
        </div>
    );
}
