"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, GraduationCap, FileText, UserCircle, LogOut, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const links = [
        { href: "/dashboard", label: "Início", icon: LayoutDashboard },
        { href: "/classes", label: "Turmas & Alunos", icon: GraduationCap },
        { href: "/builder", label: "Criar Avaliação", icon: FileText },
        { href: "/exams", label: "Minhas Avaliações", icon: FileText },
        { href: "/scanner", label: "Correção IA", icon: Sparkles },
        { href: "/tutorial", label: "Ajuda & Tutoriais", icon: BookOpen },
    ];

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <aside className="w-72 h-screen flex flex-col fixed left-0 top-0 z-50 glass border-r-0">
            <div className="p-8 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={20} />
                </div>
                <div>
                    <span className="font-bold text-xl text-gray-800 dark:text-white block leading-none">Corrige</span>
                    <span className="text-xs text-indigo-500 dark:text-indigo-300 font-medium tracking-wide">LAB</span>
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
                                ? "bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-700 dark:text-white shadow-lg border border-indigo-500/30"
                                : "text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-white"
                                }`}
                        >
                            <Icon size={20} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "group-hover:text-indigo-600 dark:group-hover:text-white transition-colors"} />
                            <span className="font-medium relative z-10">{link.label}</span>
                            {isActive && (
                                <div className="absolute inset-0 bg-indigo-500/10 blur-xl"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto">
                {mounted && (
                    <>
                        <div className="glass-card p-4 rounded-2xl mb-2 flex items-center gap-3 border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/5">
                            {user?.photoURL ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-indigo-500/50" />
                            ) : (
                                <UserCircle size={40} className="text-gray-400" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user?.displayName?.split(" ")[0] || "Professor"}</p>
                                <p className="text-xs text-gray-500 truncate">Plano Pro</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={16} />
                            Sair do Portal
                        </button>
                    </>
                )}
            </div>
        </aside>
    );
}
