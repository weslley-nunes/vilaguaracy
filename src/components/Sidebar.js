"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    GraduationCap, 
    FileText, 
    UserCircle, 
    LogOut, 
    Sparkles, 
    BookOpen, 
    BarChart2, 
    Activity, 
    TrendingUp, 
    FileSearch, 
    PlusSquare, 
    ClipboardList 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
    const pathname = usePathname();
    const { user, activeRole, switchRole, logout } = useAuth();

    const role = activeRole || 'professor';

    let links = [];
    if (role === 'gestao') {
        links = [
            { href: "/dashboard", label: "Painel Geral", icon: LayoutDashboard },
            { href: "/builder", label: "Criar Avaliação Base", icon: PlusSquare },
            { href: "/exams", label: "Todas as Provas", icon: ClipboardList },
            { href: "/scanner", label: "Scanner de Correção", icon: Sparkles },
            { href: "/resultados", label: "Resultados Analíticos", icon: BarChart2 },
            { href: "/coordenacao", label: "Progresso de Provas", icon: Activity },
            { href: "/habilidades", label: "Habilidades & Gráficos", icon: TrendingUp },
            { href: "/tutorial", label: "Ajuda & Tutoriais", icon: BookOpen },
        ];
    } else if (role === 'coordenador') {
        links = [
            { href: "/dashboard", label: "Painel Coord.", icon: LayoutDashboard },
            { href: "/classes", label: "Minhas Turmas", icon: GraduationCap },
            { href: "/scanner", label: "Scanner de Correção", icon: Sparkles },
            { href: "/resultados", label: "Resultados Analíticos", icon: BarChart2 },
            { href: "/coordenacao", label: "Progresso de Provas", icon: Activity },
            { href: "/exams", label: "Acompanhamento", icon: FileSearch },
            { href: "/habilidades", label: "Habilidades", icon: TrendingUp },
            { href: "/tutorial", label: "Tutoriais", icon: BookOpen },
        ];
    } else {
        links = [
            { href: "/dashboard", label: "Início", icon: LayoutDashboard },
            { href: "/builder", label: "Adicionar Questões", icon: PlusSquare },
            { href: "/exams", label: "Minhas Avaliações", icon: ClipboardList },
            { href: "/scanner", label: "Scanner de Correção", icon: Sparkles },
            { href: "/resultados", label: "Resultados Analíticos", icon: BarChart2 },
            { href: "/tutorial", label: "Ajuda & Tutoriais", icon: BookOpen },
        ];
    }

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} h-screen flex flex-col fixed left-0 top-0 z-50 glass border-r-0 transition-all duration-300 group/sidebar print:hidden`}>
            {/* Header / Logo */}
            <div className={`p-6 flex items-center justify-between mb-4 ${isCollapsed ? 'px-4' : 'px-8'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vg-dark to-vg-navy flex items-center justify-center text-white shadow-lg shrink-0">
                        <Sparkles size={20} />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fade-in whitespace-nowrap">
                            <span className="font-bold text-xl text-gray-800 dark:text-white block leading-none">Vila</span>
                            <span className="text-xs text-vg-dark dark:text-vg-navy font-medium tracking-wide">GUARACY</span>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors ${isCollapsed ? 'hidden group-hover/sidebar:block absolute right-2 bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-white/10' : ''}`}
                >
                    {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group/item overflow-visible ${isActive
                                ? "bg-vg-dark/10 dark:bg-vg-dark/20 text-vg-hover dark:text-white shadow-sm border border-vg-dark/10"
                                : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-vg-dark dark:hover:text-white"
                                }`}
                        >
                            <Icon size={20} className={`shrink-0 ${isActive ? "text-vg-dark dark:text-vg-navy" : "group-hover/item:text-vg-dark dark:group-hover/item:text-white transition-colors"}`} />
                            
                            {!isCollapsed ? (
                                <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{link.label}</span>
                            ) : (
                                <div className="fixed left-20 ml-2 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl whitespace-nowrap border border-white/10">
                                    {link.label}
                                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-white/10"></div>
                                </div>
                            )}

                            {isActive && !isCollapsed && (
                                <div className="absolute left-0 w-1 h-6 bg-vg-dark rounded-r-full"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Profile Area */}
            <div className={`p-4 mt-auto transition-all ${isCollapsed ? 'px-2' : 'px-6'}`}>
                {mounted && (
                    <div className="glass-card p-3 rounded-2xl mb-2 border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/5 relative group/profile">
                        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'mb-3'}`}>
                            {user?.photoURL ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-vg-dark/50 shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                                    <UserCircle size={24} className="text-gray-400" />
                                </div>
                            )}
                            
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user?.displayName?.split(" ")[0] || "Professor"}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{role}</p>
                                </div>
                            )}

                            {isCollapsed && (
                                <div className="fixed left-20 ml-2 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover/profile:opacity-100 pointer-events-none transition-opacity z-[60] shadow-xl whitespace-nowrap border border-white/10">
                                    {user?.displayName || "Usuário"} ({role})
                                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-white/10"></div>
                                </div>
                            )}
                        </div>

                        {!isCollapsed && (
                            <>
                                {/* Seletor de Perfil Integrado */}
                                {(user?.role === 'gestao' || user?.role === 'coordenador') && (
                                    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-black/20 rounded-xl mb-2 mt-2">
                                        {user.role === 'gestao' && (
                                            <button 
                                                onClick={() => switchRole('gestao')}
                                                className={`flex-1 text-[9px] py-1 rounded-lg transition-all font-bold ${role === 'gestao' ? 'bg-vg-dark text-white shadow-sm' : 'text-gray-400'}`}
                                            >
                                                GESTÃO
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => switchRole('coordenador')}
                                            className={`flex-1 text-[9px] py-1 rounded-lg transition-all font-bold ${role === 'coordenador' ? 'bg-vg-dark text-white shadow-sm' : 'text-gray-400'}`}
                                        >
                                            COORD.
                                        </button>
                                        <button 
                                            onClick={() => switchRole('professor')}
                                            className={`flex-1 text-[9px] py-1 rounded-lg transition-all font-bold ${role === 'professor' ? 'bg-vg-dark text-white shadow-sm' : 'text-gray-400'}`}
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
                            </>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
