"use client";
import { useState } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";

export default function CheckPage() {
    const [examId, setExamId] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!examId.trim()) return;

        setLoading(true);
        setError("");
        
        // Simulação de busca. Num ambiente real, chamaria a API passando examId e a matrícula do aluno
        setTimeout(() => {
            if (examId.toLowerCase() === "mock") {
                setResult({
                    studentName: "João Silva",
                    examTitle: "Avaliação de História",
                    score: 8.5,
                    skills: [
                        { label: "EF06HI02", correct: 4, total: 5 },
                        { label: "EF06HI03", correct: 2, total: 3 }
                    ],
                    questions: [
                        { id: 1, correct: true, skill: "EF06HI02" },
                        { id: 2, correct: true, skill: "EF06HI02" },
                        { id: 3, correct: false, skill: "EF06HI03" },
                    ]
                });
            } else {
                setError("Prova não encontrada. Verifique o ID impresso no gabarito.");
                setResult(null);
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 p-8 text-center text-white">
                    <h1 className="text-3xl font-bold mb-2">Vila Guaracy</h1>
                    <p className="opacity-80">Portal do Aluno</p>
                </div>
                
                <div className="p-8">
                    {!result ? (
                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Código da Prova</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="text" 
                                        value={examId}
                                        onChange={(e) => setExamId(e.target.value)}
                                        placeholder="Ex: 1713401923"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg font-mono"
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? "Buscando..." : "Verificar Resultado"}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">{result.studentName}</h2>
                                <p className="text-gray-500">{result.examTitle}</p>
                            </div>
                            
                            <div className="bg-indigo-50 rounded-2xl p-6 text-center border border-indigo-100">
                                <span className="block text-sm font-bold text-indigo-400 uppercase tracking-wide mb-1">Nota Final</span>
                                <span className="text-5xl font-black text-indigo-600">{result.score.toFixed(1)}</span>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-800 border-b pb-2">Habilidades Avaliadas</h3>
                                {result.skills.map((skill, idx) => {
                                    const percent = Math.round((skill.correct / skill.total) * 100);
                                    return (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-600">{skill.label}</span>
                                            <div className="flex-1 mx-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${percent >= 60 ? 'bg-green-500' : 'bg-orange-500'}`} 
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400">{percent}%</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <button 
                                onClick={() => setResult(null)}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition-colors"
                            >
                                Nova Consulta
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
