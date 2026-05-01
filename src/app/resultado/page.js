"use client";
import { useState } from "react";
import { db } from "@/services/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Search, GraduationCap, FileText, CheckCircle, XCircle, TrendingUp, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResultadoPage() {
    const [accessCode, setAccessCode] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!accessCode.trim()) return;

        setLoading(true);
        setError("");
        setResults(null);

        try {
            const q = query(
                collection(db, "corrections"),
                where("accessCode", "==", accessCode.trim().toUpperCase()),
                orderBy("correctedAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setError("Nenhum resultado encontrado para este código. Verifique se o código está correto ou se a prova já foi corrigida.");
            } else {
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setResults(data);
            }
        } catch (err) {
            console.error("Erro ao buscar resultados:", err);
            setError("Ocorreu um erro ao buscar seus resultados. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="bg-vg-dark p-3 rounded-2xl shadow-lg">
                            <GraduationCap size={40} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Portal do Aluno - <span className="text-vg-dark">Vila Guaracy</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Consulte o resultado das suas avaliações usando seu código único.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-vg-light/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    
                    <form onSubmit={handleSearch} className="relative z-10">
                        <label htmlFor="accessCode" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                            Seu Código de Acesso
                        </label>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    id="accessCode"
                                    type="text"
                                    placeholder="Ex: VG9KST"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:border-vg-dark focus:ring-2 focus:ring-vg-light outline-none transition-all text-xl font-bold tracking-widest uppercase"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-vg-dark hover:bg-vg-hover text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-vg-light/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? "Buscando..." : "Ver Resultados"}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                        {error && (
                            <p className="mt-4 text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                                {error}
                            </p>
                        )}
                    </form>
                </div>

                {/* Results List */}
                {results && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 px-2">
                            <TrendingUp size={24} className="text-vg-dark" />
                            Suas Avaliações
                        </h2>
                        
                        {results.map((res) => (
                            <div key={res.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-vg-light/30 p-3 rounded-xl">
                                                <FileText size={28} className="text-vg-dark" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{res.examTitle || "Avaliação"}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(res.correctedAt?.seconds * 1000).toLocaleDateString('pt-BR')}</span>
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold uppercase tracking-wider">{res.accessCode}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 bg-vg-dark text-white px-6 py-3 rounded-2xl shadow-inner">
                                            <span className="text-sm uppercase font-bold opacity-80">Nota:</span>
                                            <span className="text-3xl font-black">{res.score}</span>
                                        </div>
                                    </div>

                                    {/* Skills Breakdown */}
                                    {res.skills && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                            {Object.entries(res.skills).map(([skill, stats]) => (
                                                <div key={skill} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-gray-500 uppercase">{skill}</span>
                                                        <span className="text-sm font-bold text-vg-dark">{Math.round((stats.correct / stats.total) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-vg-dark h-full transition-all duration-1000" 
                                                            style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
                                                        <span>{stats.correct} acertos</span>
                                                        <span>{stats.total} total</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Detailed Answers (Optional) */}
                                    <details className="mt-8 group">
                                        <summary className="text-sm font-bold text-vg-dark hover:underline cursor-pointer flex items-center gap-2 outline-none">
                                            Ver detalhamento por questão
                                        </summary>
                                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                                            {res.results?.map((ans, idx) => (
                                                <div key={idx} className={`flex flex-col items-center p-2 rounded-lg border ${ans.isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                                    <span className="text-[10px] font-bold text-gray-400">Q{ans.q}</span>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-sm font-black ${ans.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{ans.marked}</span>
                                                        {ans.isCorrect ? <CheckCircle size={12} className="text-green-500" /> : <XCircle size={12} className="text-red-500" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-4xl mx-auto mt-12 text-center text-gray-400 text-sm">
                <p>© {new Date().getFullYear()} Escola Estadual Vila Guaracy - Todos os direitos reservados.</p>
                <Link href="/" className="mt-2 inline-block text-vg-dark hover:underline font-medium">Voltar ao Início</Link>
            </div>
        </div>
    );
}
