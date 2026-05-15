"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { ExamService } from "@/services/examService";
import { getClassesByUser } from "@/services/classesService";
import { Shield, Target, Users, BookOpen, Filter, Search, Loader2 } from "lucide-react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

export default function HabilidadesPage() {
    const { user } = useAuth();
    const [allCorrections, setAllCorrections] = useState([]);
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        classId: "",
        subject: "",
        bimester: "",
        examId: ""
    });

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [corrs, exms, clss] = await Promise.all([
                    ExamService.listAllCorrections(),
                    ExamService.listAll(),
                    getClassesByUser()
                ]);
                setAllCorrections(corrs);
                setExams(exms);
                setClasses(clss);
            } catch (e) {
                console.error("Error loading dashboard data", e);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Derived Data: List of unique subjects and bimesters for filters
    const subjects = useMemo(() => [...new Set(exams.map(e => e.subject).filter(Boolean))], [exams]);
    const bimesters = useMemo(() => [...new Set(exams.map(e => e.bimester).filter(Boolean))], [exams]);

    // Apply Filters
    const filteredCorrections = useMemo(() => {
        return allCorrections.filter(corr => {
            const exam = exams.find(e => e.id === corr.examId);
            
            // Filter by Class (matching ID or Name for robustness)
            if (filters.classId) {
                const selectedClass = classes.find(cl => cl.id === filters.classId);
                if (corr.classId !== filters.classId && corr.classId !== selectedClass?.name) return false;
            }
            
            // Filter by Subject
            if (filters.subject && exam?.subject !== filters.subject) return false;
            
            // Filter by Bimester
            if (filters.bimester && exam?.bimester !== filters.bimester) return false;

            // Filter by Exam ID
            if (filters.examId && corr.examId !== filters.examId) return false;

            return true;
        });
    }, [allCorrections, filters, exams, classes]);

    // Process Skills Stats (for Radar Chart and Critical Table)
    const processedSkills = useMemo(() => {
        const stats = {};
        filteredCorrections.forEach(corr => {
            corr.details?.forEach(detail => {
                const skillId = detail.habilidade || "N/A";
                if (skillId === "N/A") return;
                
                if (!stats[skillId]) {
                    stats[skillId] = { subject: skillId, name: skillId, hits: 0, total: 0 };
                }
                stats[skillId].total++;
                if (detail.isCorrect) stats[skillId].hits++;
            });
        });

        return Object.values(stats)
            .map(s => ({
                ...s,
                A: Math.round((s.hits / s.total) * 100),
                fullMark: 100
            }))
            .sort((a, b) => b.total - a.total); // Sort by volume
    }, [filteredCorrections]);

    // Process Class Data (for Bar Chart)
    const processedClasses = useMemo(() => {
        const classMap = {};
        filteredCorrections.forEach(corr => {
            // Find class name for the chart labels
            const classObj = classes.find(cl => cl.id === corr.classId || cl.name === corr.classId);
            const className = classObj?.name || corr.classId || "Outros";
            
            if (!classMap[className]) {
                classMap[className] = { name: className, hits: 0, total: 0 };
            }
            
            // Aggregate all questions for this class
            corr.details?.forEach(d => {
                classMap[className].total++;
                if (d.isCorrect) classMap[className].hits++;
                
                // Also track top 3 skills for bar breakdown if needed
                const skillId = d.habilidade;
                if (skillId) {
                    if (!classMap[className][skillId]) classMap[className][skillId] = { hits: 0, total: 0 };
                    classMap[className][skillId].total++;
                    if (d.isCorrect) classMap[className][skillId].hits++;
                }
            });
        });

        return Object.values(classMap).map(c => {
            const result = { name: c.name, score: Math.round((c.hits / c.total) * 100) };
            // Flatten skill percentages for the bars
            Object.keys(c).forEach(key => {
                if (c[key]?.total) {
                    result[key] = Math.round((c[key].hits / c[key].total) * 100);
                }
            });
            return result;
        });
    }, [filteredCorrections, classes]);

    const role = user?.role || "professor";
    const isGestao = role === "gestao" || role === "coordenador";

    if (!isGestao) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center bg-red-50 p-8 rounded-2xl border border-red-100">
                    <Shield size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-700">Acesso Restrito</h2>
                    <p className="text-red-500 text-sm mt-2">Esta visualização analítica é exclusiva para Gestão e Coordenação.</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-[60vh]">
                <Loader2 size={40} className="animate-spin text-vg-navy mb-4" />
                <p className="text-gray-500 font-medium">Processando inteligência pedagógica...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Target className="text-vg-dark" />
                        Desempenho & Habilidades
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Análise de proficiência por habilidade (BNCC/Própria) em toda a instituição.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-vg-light px-4 py-2 rounded-xl border border-vg-light">
                        <span className="block text-[10px] uppercase font-bold text-vg-dark">Provas Corrigidas</span>
                        <span className="text-xl font-black text-vg-hover">{filteredCorrections.length}</span>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                        <span className="block text-[10px] uppercase font-bold text-green-600">Habilidades Ativas</span>
                        <span className="text-xl font-black text-green-700">{processedSkills.length}</span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
                        <Users size={10} /> Turma
                    </label>
                    <select 
                        value={filters.classId} 
                        onChange={e => setFilters({...filters, classId: e.target.value})}
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-vg-navy outline-none"
                    >
                        <option value="">Todas as Turmas</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
                        <BookOpen size={10} /> Disciplina
                    </label>
                    <select 
                        value={filters.subject} 
                        onChange={e => setFilters({...filters, subject: e.target.value})}
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-vg-navy outline-none"
                    >
                        <option value="">Geral (Todas)</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
                        <Target size={10} /> Bimestre
                    </label>
                    <select 
                        value={filters.bimester} 
                        onChange={e => setFilters({...filters, bimester: e.target.value})}
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-vg-navy outline-none"
                    >
                        <option value="">Anual / Todos</option>
                        {bimesters.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
                        <Filter size={10} /> Avaliação
                    </label>
                    <select 
                        value={filters.examId} 
                        onChange={e => setFilters({...filters, examId: e.target.value})}
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-vg-navy outline-none"
                    >
                        <option value="">Todas as Provas</option>
                        {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => setFilters({ classId: "", subject: "", bimester: "", examId: "" })}
                    className="md:col-span-1 text-[10px] font-bold uppercase text-red-400 hover:text-red-600 transition-colors self-end pb-2"
                >
                    Limpar Filtros
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target size={18} className="text-vg-dark" />
                        Radar de Proficiência por Habilidade
                    </h3>
                    <div className="h-80 w-full">
                        {processedSkills.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">Sem dados suficientes para o radar</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={processedSkills.slice(0, 8)}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar name="Acertos (%)" dataKey="A" stroke="#2D4A3E" fill="#2D4A3E" fillOpacity={0.6} />
                                    <Tooltip />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-vg-dark" />
                        Desempenho Geral das Turmas
                    </h3>
                    <div className="h-80 w-full">
                        {processedClasses.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 italic text-sm">Sem dados para as turmas selecionadas</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedClasses} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" fill="#2D4A3E" name="Média Geral (%)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Critical Skills Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-orange-50/50">
                    <h3 className="font-bold text-orange-800 flex items-center gap-2">
                        <BookOpen size={18} className="text-orange-500" />
                        Atenção: Habilidades com Baixo Desempenho
                    </h3>
                    <p className="text-sm text-orange-600 mt-1">Habilidades com índice de acerto abaixo de 50% nos filtros aplicados.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Código Habilidade</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Volume (Qtd)</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Proficiência</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Ação Recomendada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {processedSkills.filter(s => s.A < 50).length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400 italic">Ótimo trabalho! Nenhuma habilidade crítica identificada com estes filtros.</td>
                                </tr>
                            ) : (
                                processedSkills.filter(s => s.A < 50).map((skill, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-800">{skill.subject}</div>
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">BNCC / Referencial</div>
                                        </td>
                                        <td className="p-4 text-sm font-bold text-gray-600">{skill.total} questões</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-red-500 h-full" style={{ width: `${skill.A}%` }}></div>
                                                </div>
                                                <span className="text-xs font-black text-red-600">{skill.A}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-xs text-vg-dark font-bold hover:underline px-3 py-1.5 bg-vg-light rounded-lg">Sugestão: Reforço Pedagógico</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
