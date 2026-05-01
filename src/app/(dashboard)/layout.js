"use client";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert, LogOut } from "lucide-react";

export default function DashboardLayout({ children }) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    if (user.role === 'pendente') {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-yellow-50 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} className="text-yellow-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Conta em Análise</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Seu cadastro foi realizado com sucesso e está aguardando validação da equipe de Gestão Escolar. Assim que for aprovado, seu acesso será liberado.
                    </p>
                    <button 
                        onClick={logout}
                        className="btn btn-outline w-full flex justify-center gap-2"
                    >
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] flex transition-colors duration-500">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative">
                <div className="absolute top-6 right-8 z-50">
                    <ThemeToggle />
                </div>
                <div className="max-w-6xl mx-auto pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
