"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, FileText, UserCircle, LogOut, Sparkles, BookOpen, BarChart2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, activeRole, switchRole, logout } = useAuth();

    const role = activeRole || 'professor';

    let links = [];
    if (role === 'gestao') {
        links = [
            { href: "/dashboard", label: "Gestão Geral", icon: LayoutDashboard },
            { href: "/usuarios", label: "Gestão de Usuários", icon: UserCircle },
            { href: "/classes", label: "Turmas & Alunos", icon: GraduationCap },
            { href: "/builder", label: "Criar Avaliação Base", icon: FileText },
            { href: "/exams", label: "Todas as Provas", icon: FileText },
            { href: "/habilidades", label: "Habilidades & Gráficos", icon: BarChart2 },
            { href: "/tutorial", label: "Ajuda & Tutoriais", icon: BookOpen },
        ];
    } else if (role === 'coordenador') {
        links = [
            { href: "/dashboard", label: "Painel Coord.", icon: LayoutDashboard },
            { href: "/classes", label: "Minhas Turmas", icon: GraduationCap },
            { href: "/exams", label: "Acompanhamento", icon: FileText },
            { href: "/habilidades", label: "Habilidades", icon: BarChart2 },
            { href: "/tutorial", label: "Tutoriais", icon: BookOpen },
        ];
    } else {
        links = [
            { href: "/dashboard", label: "Início", icon: LayoutDashboard },
            { href: "/builder", label: "Adicionar Questões", icon: FileText },
            { href: "/exams", label: "Minhas Avaliações", icon: FileText },
            { href: "/scanner", label: "Correção IA", icon: Sparkles },
            { href: "/acompanhamento", label: "Meus Resultados", icon: BarChart2 },
            { href: "/tutorial", label: "Ajuda & Tutoriais", icon: BookOpen },
        ];
    }

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <aside className="w-72 h-screen flex flex-col fixed left-0 top-0 z-50 glass border-r-0">
            <div className="p-8 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vg-dark to-vg-navy flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={20} />
                </div>
                <div>
                    <span className="font-bold text-xl text-gray-800 dark:text-white block leading-none">Vila</span>
                    <span className="text-xs text-vg-dark dark:text-vg-navy font-medium tracking-wide">GUARACY</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden group ${isActive
                                ? "bg-vg-dark/10 dark:bg-vg-dark/20 text-vg-hover dark:text-white shadow-lg border border-vg-dark/30"
                                : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-vg-dark dark:hover:text-white"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "text-vg-dark dark:text-vg-navy" : "group-hover:text-vg-dark dark:group-hover:text-white transition-colors"} />
                            <span className="font-medium relative z-10">{link.label}</span>
                            {isActive && (
                                <div className="absolute inset-0 bg-vg-dark/10 blur-xl"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto">
                {mounted && (
                    <>
                        <div className="glass-card p-4 rounded-2xl mb-2 border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/5">
                            <div className="flex items-center gap-3 mb-3">
                                {user?.photoURL ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-vg-dark/50" />
                                ) : (
                                    <UserCircle size={40} className="text-gray-400" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user?.displayName?.split(" ")[0] || "Professor"}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{role}</p>
                                </div>
                            </div>

                            {/* Seletor de Perfil Integrado */}
                            {(user?.role === 'gestao' || user?.role === 'coordenador') && (
                                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-black/20 rounded-xl mb-2">
                                    {user.role === 'gestao' && (
                                        <button 
                                            onClick={() => switchRole('gestao')}
                                            className={`flex-1 text-[9px] py-1 rounded-lg transition-all font-bold ${role === 'gestao' ? 'bg-vg-dark text-white shadow-sm' : 'text-gray-400'}`}
                                            title="Perfil Gestão"
                                        >
                                            GESTÃO
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => switchRole('coordenador')}
                                        className={`flex-1 text-[9px] py-1 rounded-lg transition-all font-bold ${role === 'coordenador' ? 'bg-vg-dark text-white shadow-sm' : 'text-gray-400'}`}
                                        title="Perfil Coordenador"
                                    >
                                        COORD.
                                    </button>
                                    <button 
                                        onClick={() => switchRole('professor')}
                                        className={`flex-1 text-[9px] py-1 rounded-lg transition-all font-bold ${role === 'professor' ? 'bg-vg-dark text-white shadow-sm' : 'text-gray-400'}`}
                                        title="Perfil Professor"
                                    >
                                        PROF.
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                            >
                                <LogOut size={14} />
                                Sair do Portal
                            </button>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}
