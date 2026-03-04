import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { FileText, Users, Plus, Loader2 } from "lucide-react";
import { getClassesByUser } from "@/services/classesService";
import { ExamService } from "@/services/examService";

export default function Dashboard() {
    const { user } = useAuth();

    const [stats, setStats] = useState({ examsCount: 0, studentsCount: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadStats = async () => {
            setIsLoading(true);
            try {
                // Fetch exams and classes concurrently
                const [exams, classes] = await Promise.all([
                    ExamService.listByTeacher(user.uid),
                    getClassesByUser(user.uid)
                ]);

                // Calculate total students
                let totalStudents = 0;
                classes.forEach(c => {
                    if (c.students && Array.isArray(c.students)) {
                        totalStudents += c.students.length;
                    }
                });

                setStats({
                    examsCount: exams.length,
                    studentsCount: totalStudents
                });
            } catch (error) {
                console.error("Erro ao carregar estatísticas do dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [user]);

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {user?.displayName?.split(" ")[0] || 'Professor'}! 👋</h1>
                <p className="text-gray-500 dark:text-gray-400">Aqui está o resumo das suas atividades.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="card flex items-center gap-4 border-l-4 border-indigo-500 bg-white dark:bg-white/5 p-4 rounded-lg shadow-sm">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Avaliações Criadas</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {isLoading ? <Loader2 size={20} className="animate-spin text-indigo-400" /> : stats.examsCount}
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

            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/builder" className="group p-6 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-500 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
