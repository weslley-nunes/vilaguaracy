"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { ExamService } from "@/services/examService";
import { getClassesByUser } from "@/services/classesService";
import { UserService } from "@/services/userService";
import { Shield, Target, Users, BookOpen, Filter, Search, Loader2, Trash2, RotateCcw, Edit3, X, AlertCircle, Sparkles } from "lucide-react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

export default function HabilidadesPage() {
    const { user } = useAuth();
    const [allCorrections, setAllCorrections] = useState([]);
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [filters, setFilters] = useState({
        classId: "",
        subject: "",
        bimester: "",
        examId: "",
        teacherId: ""
    });

    const [searchStudent, setSearchStudent] = useState("");
    const [sortOrder, setSortOrder] = useState("correcao");
    const [editingCorrection, setEditingCorrection] = useState(null);
    const [editingAnswers, setEditingAnswers] = useState({});
    const [isSavingAction, setIsSavingAction] = useState(false);
    const [generatingIntervention, setGeneratingIntervention] = useState(null);
    const [interventionResult, setInterventionResult] = useState(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [corrs, exms, clss, stf] = await Promise.all([
                    ExamService.listAllCorrections(),
                    ExamService.listAll(),
                    getClassesByUser(),
                    UserService.listStaff()
                ]);
                setAllCorrections(corrs);
                setExams(exms);
                setClasses(clss);
                setStaff(stf);
            } catch (e) {
                console.error("Error loading dashboard data", e);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Derived Data: List of unique subjects and bimesters for filters
    const subjects = useMemo(() => {
        const subs = new Set();
        allCorrections.forEach(c => {
            if (c.scoresBySubject && Object.keys(c.scoresBySubject).length > 0) {
                Object.keys(c.scoresBySubject).forEach(s => subs.add(s));
            } else {
                const ex = exams.find(e => e.id === c.examId);
                if (ex && ex.subject) subs.add(ex.subject);
            }
        });
        return [...subs].sort();
    }, [allCorrections, exams]);
    
    const bimesters = useMemo(() => [...new Set(exams.map(e => e.bimester).filter(Boolean))], [exams]);

    // Apply Filters
    const filteredCorrections = useMemo(() => {
        return allCorrections.filter(corr => {
            const exam = exams.find(e => e.id === corr.examId);
            const corrClass = classes.find(cl => cl.id === corr.classId || cl.name === corr.classId);
            
            // Filter by Teacher
            if (filters.teacherId) {
                if (exam?.teacherId !== filters.teacherId && corrClass?.userId !== filters.teacherId) return false;
            }

            // Filter by Class (matching ID or Name for robustness)
            if (filters.classId) {
                if (corr.classId !== filters.classId && corr.classId !== corrClass?.name) return false;
            }
            
            // Filter by Subject
            if (filters.subject) {
                if (corr.scoresBySubject && corr.scoresBySubject[filters.subject] !== undefined) {
                    // has subject in multiobjective exam
                } else if (exam?.subject !== filters.subject) {
                    return false;
                }
            }
            
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

    // Performance Dashboard Calculations (IDEB Simulado & Areas)
    const performanceDashboard = useMemo(() => {
        if (filteredCorrections.length === 0) return null;

        let totalScore = 0;
        const studentAverages = {};
        
        const areaMapping = {
            "Linguagens": ["Língua Portuguesa", "Arte", "Educação Física", "Língua Inglesa", "Inglês", "Redação"],
            "Matemática": ["Matemática"],
            "Ciências da Natureza": ["Ciências", "Biologia", "Física", "Química"],
            "Ciências Humanas": ["História", "Geografia", "Ensino Religioso", "Filosofia", "Sociologia"]
        };
        const areaStats = {
            "Linguagens": { sum: 0, count: 0 },
            "Matemática": { sum: 0, count: 0 },
            "Ciências da Natureza": { sum: 0, count: 0 },
            "Ciências Humanas": { sum: 0, count: 0 }
        };

        filteredCorrections.forEach(corr => {
            const exam = exams.find(e => e.id === corr.examId);
            const hitRate = corr.totalCount > 0 ? (corr.correctCount / corr.totalCount) : 0;
            totalScore += hitRate * 10; // Transform to 0-10 scale
            
            // Student averages
            if (!studentAverages[corr.studentName]) studentAverages[corr.studentName] = { sum: 0, count: 0 };
            studentAverages[corr.studentName].sum += hitRate * 10;
            studentAverages[corr.studentName].count++;

            // Area averages
            if (corr.scoresBySubject && Object.keys(corr.scoresBySubject).length > 0) {
                Object.keys(corr.scoresBySubject).forEach(sub => {
                    const area = Object.keys(areaMapping).find(a => areaMapping[a].includes(sub));
                    if (area) {
                        const subDetails = corr.details?.filter(d => d.subject === sub) || [];
                        const subTotal = subDetails.length;
                        const subCorrect = subDetails.filter(d => d.isCorrect).length;
                        if (subTotal > 0) {
                            areaStats[area].sum += (subCorrect / subTotal) * 100;
                            areaStats[area].count++;
                        }
                    }
                });
            } else {
                const sub = exam?.subject;
                if (sub) {
                    const area = Object.keys(areaMapping).find(a => areaMapping[a].includes(sub));
                    if (area) {
                        areaStats[area].sum += hitRate * 100;
                        areaStats[area].count++;
                    }
                }
            }
        });

        const ideb = (totalScore / filteredCorrections.length).toFixed(1);
        
        const students = Object.keys(studentAverages).map(name => ({
            name,
            score: studentAverages[name].sum / studentAverages[name].count
        })).sort((a, b) => b.score - a.score);

        const top3 = students.slice(0, 3);
        const bottom3 = [...students].reverse().slice(0, 3);

        const areas = Object.keys(areaStats).map(a => ({
            name: a,
            score: areaStats[a].count > 0 ? Math.round(areaStats[a].sum / areaStats[a].count) : 0
        }));

        return { ideb, top3, bottom3, areas, allStudents: students };
    }, [filteredCorrections, exams]);

    // Filter corrections for administration table
    const paginatedCorrections = useMemo(() => {
        const filtered = filteredCorrections.filter(corr => {
            if (!searchStudent) return true;
            return corr.studentName?.toLowerCase().includes(searchStudent.toLowerCase());
        });

        return filtered.sort((a, b) => {
            if (sortOrder === "maior") return (b.score || 0) - (a.score || 0);
            if (sortOrder === "menor") return (a.score || 0) - (b.score || 0);
            if (sortOrder === "alfabetica") return (a.studentName || "").localeCompare(b.studentName || "");
            // "correcao" is default
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA; // Descending order for newest first
        });
    }, [filteredCorrections, searchStudent, sortOrder]);

    // Administrative Handlers
    const handleDeleteCorrection = async (corrId) => {
        if (!window.confirm("Deseja realmente excluir permanentemente esta correção? Esta ação não pode ser desfeita.")) return;
        setIsSavingAction(true);
        try {
            await ExamService.deleteCorrection(corrId);
            setAllCorrections(prev => prev.filter(c => c.id !== corrId));
        } catch (error) {
            console.error("Erro ao excluir correção:", error);
            alert("Erro ao excluir correção: " + error.message);
        } finally {
            setIsSavingAction(false);
        }
    };

    const handleResetCorrection = async (corr) => {
        if (!window.confirm("Deseja realmente zerar todas as respostas desta correção? Esta ação não pode ser desfeita e definirá a nota do aluno como zero.")) return;
        setIsSavingAction(true);
        try {
            const exam = exams.find(e => e.id === corr.examId);
            if (!exam) throw new Error("Avaliação correspondente não encontrada.");
            
            const totalCount = exam.questions?.length || corr.totalCount || 0;
            const details = [];
            const skillsStats = {};
            const resetAnswers = {};

            if (exam.questions) {
                exam.questions.forEach((q, idx) => {
                    resetAnswers[idx] = "BRANCO";
                    
                    const baseCorrect = q.correct || (exam.answerKey && exam.answerKey[idx]);
                    const correctStr = String(baseCorrect || "").trim();
                    const cleanCorrect = correctStr.length === 1 
                        ? correctStr.toUpperCase() 
                        : correctStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "").toUpperCase();

                    details.push({
                        questionIndex: idx,
                        habilidade: q.habilidade || "N/A",
                        subject: q.subject || "Geral",
                        isCorrect: false,
                        studentAnswer: "BRANCO",
                        correctAnswer: cleanCorrect || correctStr
                    });

                    const skill = q.habilidade;
                    if (skill && skill !== "N/A") {
                        if (!skillsStats[skill]) {
                            skillsStats[skill] = { correct: 0, total: 0 };
                        }
                        skillsStats[skill].total++;
                    }
                });
            }

            const updatedData = {
                score: 0,
                correctCount: 0,
                totalCount,
                details,
                answers: resetAnswers,
                skills: skillsStats
            };

            await ExamService.updateCorrection(corr.id, updatedData);
            
            setAllCorrections(prev => prev.map(c => c.id === corr.id ? { ...c, ...updatedData } : c));
        } catch (error) {
            console.error("Erro ao zerar correção:", error);
            alert("Erro ao zerar correção: " + error.message);
        } finally {
            setIsSavingAction(false);
        }
    };

    const handleEditCorrection = (corr) => {
        setEditingCorrection(corr);
        setEditingAnswers(corr.answers || {});
    };

    const handleEditBubbleClick = (qIndex, option) => {
        setEditingAnswers(prev => ({
            ...prev,
            [qIndex]: prev[qIndex] === option ? null : option
        }));
    };

    const handleSaveEdit = async () => {
        if (!editingCorrection) return;
        setIsSavingAction(true);
        try {
            const exam = exams.find(e => e.id === editingCorrection.examId);
            if (!exam) throw new Error("Avaliação correspondente não encontrada.");

            let correctCount = 0;
            const details = [];
            const skillsStats = {};
            const totalCount = exam.questions?.length || editingCorrection.totalCount || 0;
            const subjectQuestions = {};
            const subjectCorrect = {};

            if (exam.questions) {
                exam.questions.forEach((q, idx) => {
                    const studentAns = editingAnswers[idx];
                    const baseCorrect = q.correct || (exam.answerKey && exam.answerKey[idx]);
                    const correctStr = String(baseCorrect || "").trim();
                    const cleanCorrect = correctStr.length === 1 
                        ? correctStr.toUpperCase() 
                        : correctStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "").toUpperCase();

                    const isCorrect = studentAns === cleanCorrect || studentAns === correctStr.toUpperCase();
                    if (isCorrect) correctCount++;

                    const subject = q.subject || "Geral";
                    if (!subjectQuestions[subject]) {
                        subjectQuestions[subject] = 0;
                        subjectCorrect[subject] = 0;
                    }
                    subjectQuestions[subject]++;
                    if (isCorrect) {
                        subjectCorrect[subject]++;
                    }

                    details.push({
                        questionIndex: idx,
                        habilidade: q.habilidade || "N/A",
                        subject,
                        isCorrect,
                        studentAnswer: studentAns || null,
                        correctAnswer: cleanCorrect || correctStr
                    });

                    const skill = q.habilidade;
                    if (skill && skill !== "N/A") {
                        if (!skillsStats[skill]) {
                            skillsStats[skill] = { correct: 0, total: 0 };
                        }
                        skillsStats[skill].total++;
                        if (isCorrect) {
                            skillsStats[skill].correct++;
                        }
                    }
                });
            }

            const scoresBySubject = {};
            let totalCalculatedScore = 0;
            Object.keys(subjectQuestions).forEach(sub => {
                const totalQ = subjectQuestions[sub];
                const correctQ = subjectCorrect[sub];
                const subjectScore = totalQ > 0 ? (correctQ / totalQ) * 2.0 : 0;
                scoresBySubject[sub] = parseFloat(subjectScore.toFixed(2));
                totalCalculatedScore += subjectScore;
            });
            totalCalculatedScore = parseFloat(totalCalculatedScore.toFixed(2));

            const updatedData = {
                score: totalCalculatedScore,
                correctCount,
                totalCount,
                details,
                answers: editingAnswers,
                skills: skillsStats,
                scoresBySubject
            };

            await ExamService.updateCorrection(editingCorrection.id, updatedData);

            setAllCorrections(prev => prev.map(c => c.id === editingCorrection.id ? { ...c, ...updatedData } : c));
            setEditingCorrection(null);
        } catch (error) {
            console.error("Erro ao atualizar correção:", error);
            alert("Erro ao atualizar correção: " + error.message);
        } finally {
            setIsSavingAction(false);
        }
    };

    const handleGenerateIntervention = async (skill) => {
        setGeneratingIntervention(skill.subject);
        try {
            const className = classes.find(c => c.id === filters.classId)?.name || "";
            const res = await fetch("/api/intervention", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ skill: skill.subject, hitRate: skill.A, className })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            setInterventionResult({ skill: skill.subject, ...data });
        } catch (err) {
            alert("Erro ao gerar intervenção: " + err.message);
        } finally {
            setGeneratingIntervention(null);
        }
    };

    const role = user?.role || "professor";
    const isGestao = role === "gestao" || role === "coordenador";

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
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1">
                        <Users size={10} /> Professor
                    </label>
                    <select 
                        value={filters.teacherId} 
                        onChange={e => setFilters({...filters, teacherId: e.target.value})}
                        className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:border-vg-navy outline-none"
                    >
                        <option value="">Todos</option>
                        {staff.map(t => <option key={t.uid} value={t.uid}>{t.displayName}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => setFilters({ classId: "", subject: "", bimester: "", examId: "", teacherId: "" })}
                    className="md:col-span-1 text-[10px] font-bold uppercase text-red-400 hover:text-red-600 transition-colors self-end pb-2"
                >
                    Limpar Filtros
                </button>
            </div>

            {/* Performance Dashboard */}
            {performanceDashboard && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* IDEB Simulado */}
                    <div className="bg-gradient-to-br from-vg-navy to-vg-dark p-6 rounded-2xl shadow-sm border border-transparent text-white flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Target size={64} />
                        </div>
                        <h3 className="text-sm uppercase font-bold text-white/80 tracking-widest mb-2 z-10">IDEB Simulado</h3>
                        <div className="text-6xl font-black z-10">{performanceDashboard.ideb}</div>
                        <div className="text-xs text-white/60 mt-2 z-10">Média geral de 0 a 10</div>
                    </div>

                    {/* Destaques e Atenção */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="text-sm uppercase font-bold text-gray-400 tracking-widest mb-4">Análise de Alunos</h3>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-[10px] font-bold text-green-600 uppercase mb-2">Destaques</h4>
                                <ul className="space-y-1">
                                    {performanceDashboard.top3.map((st, i) => (
                                        <li key={i} className="text-xs font-bold text-gray-700 truncate"><span className="text-green-500 mr-1">{st.score.toFixed(1)}</span> {st.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-red-500 uppercase mb-2">Atenção</h4>
                                <ul className="space-y-1">
                                    {performanceDashboard.bottom3.map((st, i) => (
                                        <li key={i} className="text-xs font-bold text-gray-700 truncate"><span className="text-red-400 mr-1">{st.score.toFixed(1)}</span> {st.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Médias por Área */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm uppercase font-bold text-gray-400 tracking-widest mb-4">Média por Área (%)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {performanceDashboard.areas.map((area, i) => (
                                <div key={i}>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1 truncate" title={area.name}>{area.name.replace("Ciências da ", "").replace("Ciências ", "")}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-vg-hover" style={{ width: `${area.score}%` }}></div>
                                        </div>
                                        <span className="text-xs font-black text-vg-dark">{area.score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Critical Skills Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100 bg-orange-50/50">
                        <h3 className="font-bold text-orange-800 flex items-center gap-2">
                            <BookOpen size={18} className="text-orange-500" />
                            Atenção: Habilidades Críticas
                        </h3>
                        <p className="text-sm text-orange-600 mt-1">Acertos abaixo de 50%.</p>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Código Habilidade</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Proficiência</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedSkills.filter(s => s.A < 50).length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-10 text-center text-gray-400 italic">Nenhuma habilidade crítica identificada.</td>
                                    </tr>
                                ) : (
                                    processedSkills.filter(s => s.A < 50).map((skill, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{skill.subject}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">{skill.total} questões</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-red-500 h-full" style={{ width: `${skill.A}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-black text-red-600">{skill.A}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => handleGenerateIntervention(skill)}
                                                    disabled={generatingIntervention === skill.subject}
                                                    className="text-[10px] uppercase flex items-center gap-1 text-vg-hover font-bold hover:bg-vg-light px-3 py-2 rounded-lg transition-colors border border-vg-hover/20 disabled:opacity-50"
                                                >
                                                    {generatingIntervention === skill.subject ? (
                                                        <><Loader2 size={14} className="animate-spin" /> Gerando...</>
                                                    ) : (
                                                        <><Sparkles size={14} /> Gerar Intervenção</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* High Performance Skills Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                    <div className="p-6 border-b border-gray-100 bg-green-50/50">
                        <h3 className="font-bold text-green-800 flex items-center gap-2">
                            <Target size={18} className="text-green-500" />
                            Destaque: Maior Desempenho
                        </h3>
                        <p className="text-sm text-green-600 mt-1">Acertos iguais ou acima de 70%.</p>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Código Habilidade</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Proficiência</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedSkills.filter(s => s.A >= 70).length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="p-10 text-center text-gray-400 italic">Nenhuma habilidade de alto desempenho encontrada.</td>
                                    </tr>
                                ) : (
                                    processedSkills.filter(s => s.A >= 70).map((skill, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">{skill.subject}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">{skill.total} questões</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-green-500 h-full" style={{ width: `${skill.A}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-black text-green-600">{skill.A}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <button 
                                                    onClick={() => handleGenerateIntervention(skill)}
                                                    disabled={generatingIntervention === skill.subject}
                                                    className="text-[10px] uppercase flex items-center gap-1 text-vg-hover font-bold hover:bg-vg-light px-3 py-2 rounded-lg transition-colors border border-vg-hover/20 disabled:opacity-50"
                                                >
                                                    {generatingIntervention === skill.subject ? (
                                                        <><Loader2 size={14} className="animate-spin" /> Gerando...</>
                                                    ) : (
                                                        <><Sparkles size={14} /> Sugerir Avanço</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Administrative Correction Management Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-vg-light/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h3 className="font-bold text-vg-dark flex items-center gap-2">
                            <Shield size={18} className="text-vg-dark" />
                            Painel Administrativo: Gerenciar Correções
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Exclua, zere ou edite os cartões de respostas dos alunos caso existam divergências.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="text-xs p-2 rounded-lg border border-gray-200 focus:border-vg-navy outline-none bg-white min-w-[140px]"
                        >
                            <option value="correcao">Data de Correção</option>
                            <option value="alfabetica">Ordem Alfabética</option>
                            <option value="maior">Maior Nota</option>
                            <option value="menor">Menor Nota</option>
                        </select>
                        <div className="relative w-full sm:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Buscar aluno..." 
                                value={searchStudent}
                                onChange={e => setSearchStudent(e.target.value)}
                                className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-vg-navy outline-none"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Aluno</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Turma</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Avaliação</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Acertos</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Nota</th>
                                {isGestao && <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedCorrections.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400 italic">Nenhuma correção encontrada.</td>
                                </tr>
                            ) : (
                                paginatedCorrections.map((corr) => {
                                    const exam = exams.find(e => e.id === corr.examId);
                                    
                                    // Class Name mapping
                                    const classObj = classes.find(cl => cl.id === corr.classId || cl.name === corr.classId);
                                    const className = classObj?.name || corr.classId || "Geral";
                                    
                                    const hitRate = corr.totalCount > 0 ? (corr.correctCount / corr.totalCount) * 100 : 0;
                                    let gradeColor = "text-red-600";
                                    if (hitRate >= 70) gradeColor = "text-green-600";
                                    else if (hitRate >= 50) gradeColor = "text-yellow-600";

                                    return (
                                        <tr key={corr.id} className="hover:bg-gray-50/50">
                                            <td className="p-4 font-bold text-gray-800 text-sm">{corr.studentName}</td>
                                            <td className="p-4">
                                                <span className="bg-vg-light text-vg-hover text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                                    {className}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-bold text-gray-700 max-w-[200px] truncate" title={exam?.title || "Sem título"}>
                                                    {exam?.title || "Sem título"}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {corr.examId?.slice(-6)}</div>
                                            </td>
                                            <td className="p-4 text-xs font-bold text-gray-600">
                                                {corr.correctCount} / {corr.totalCount}
                                            </td>
                                            <td className="p-4 text-sm font-black">
                                                <span className={gradeColor}>{corr.score?.toFixed(1) || "0.0"}</span>
                                            </td>
                                            {isGestao && (
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button 
                                                            onClick={() => handleEditCorrection(corr)}
                                                            disabled={isSavingAction}
                                                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Editar Resultados"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResetCorrection(corr)}
                                                            disabled={isSavingAction}
                                                            className="text-orange-600 hover:bg-orange-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Zerar Correção"
                                                        >
                                                            <RotateCcw size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteCorrection(corr.id)}
                                                            disabled={isSavingAction}
                                                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Excluir Correção"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal Overlay */}
            {editingCorrection && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-vg-light text-vg-hover px-2 py-1 rounded-full mb-1 inline-block">
                                    Editar Resultados
                                </span>
                                <h2 className="text-xl font-bold text-gray-800">{editingCorrection.studentName}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Prova: {exams.find(e => e.id === editingCorrection.examId)?.title || "Sem título"}
                                </p>
                            </div>
                            <button 
                                onClick={() => setEditingCorrection(null)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
                            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex gap-3 text-yellow-800">
                                <AlertCircle size={20} className="shrink-0 text-yellow-600" />
                                <div>
                                    <h4 className="font-bold text-sm">Lançamento de Respostas</h4>
                                    <p className="text-xs mt-0.5">
                                        Modifique as alternativas assinaladas pelo aluno. A nota final e as proficiências por habilidade serão recalculadas automaticamente.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                {(() => {
                                    const exam = exams.find(e => e.id === editingCorrection.examId);
                                    if (!exam?.questions) return <p className="text-center text-xs text-gray-400">Questões não carregadas.</p>;

                                    return exam.questions.map((q, idx) => {
                                        const baseCorrect = q.correct || (exam.answerKey && exam.answerKey[idx]);
                                        const correctStr = String(baseCorrect || "").trim();
                                        const cleanCorrect = correctStr.length === 1 
                                            ? correctStr.toUpperCase() 
                                            : correctStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "").toUpperCase();

                                        return (
                                            <div 
                                                key={idx} 
                                                className="p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-vg-light text-vg-dark font-black flex items-center justify-center shrink-0 text-xs">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[9px] font-bold uppercase tracking-wider bg-gray-800 text-white px-1.5 py-0.5 rounded">
                                                                {q.habilidade || "N/A"}
                                                            </span>
                                                            <span className="text-[9px] uppercase font-bold text-gray-400">
                                                                {q.subject || "Geral"}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-bold text-green-600 mt-0.5">
                                                            Gabarito: {cleanCorrect}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1">
                                                    {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                                        const hasOption = q.options && q.options.length >= (opt.charCodeAt(0) - 64);
                                                        if (!hasOption && opt === 'E') return null;

                                                        const isSelected = editingAnswers[idx] === opt;
                                                        return (
                                                            <button
                                                                key={opt}
                                                                onClick={() => handleEditBubbleClick(idx, opt)}
                                                                className={`w-7 h-7 rounded-full border-2 font-bold text-xs flex items-center justify-center transition-all ${
                                                                    isSelected 
                                                                        ? 'bg-vg-navy border-vg-navy text-white shadow-sm' 
                                                                        : 'bg-white border-gray-300 text-gray-500 hover:border-vg-navy hover:text-vg-navy'
                                                                }`}
                                                            >
                                                                {opt}
                                                            </button>
                                                        )
                                                    })}
                                                    <div className="flex gap-1 border-l border-gray-200 pl-1.5 ml-1">
                                                        {['BRANCO', 'NULA'].map(opt => {
                                                            const isSelected = editingAnswers[idx] === opt;
                                                            const label = opt === 'BRANCO' ? 'BR' : 'NL';
                                                            return (
                                                                <button
                                                                    key={opt}
                                                                    onClick={() => handleEditBubbleClick(idx, opt)}
                                                                    className={`w-7 h-7 rounded border font-bold text-[9px] flex items-center justify-center transition-all ${
                                                                        isSelected 
                                                                            ? 'bg-red-50 border-red-400 text-red-700 shadow-sm' 
                                                                            : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500'
                                                                    }`}
                                                                    title={opt}
                                                                >
                                                                    {label}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50 flex gap-3">
                            <button 
                                onClick={() => setEditingCorrection(null)}
                                disabled={isSavingAction}
                                className="flex-1 text-xs py-3 border border-gray-300 hover:bg-gray-100 rounded-xl transition-all font-bold text-gray-600 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                disabled={isSavingAction}
                                className="flex-1 text-xs py-3 bg-vg-dark hover:bg-vg-hover text-white rounded-xl transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSavingAction ? <Loader2 size={14} className="animate-spin" /> : null}
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Intervention Result Modal */}
            {interventionResult && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-vg-light to-white">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-vg-navy text-white px-2 py-1 rounded-full mb-1 inline-block">
                                    IA Educacional
                                </span>
                                <h2 className="text-lg font-bold text-gray-800">Sugestão de Intervenção</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Habilidade: {interventionResult.skill}</p>
                            </div>
                            <button 
                                onClick={() => setInterventionResult(null)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h4 className="text-[11px] font-bold text-vg-dark uppercase mb-1 flex items-center gap-1">
                                    <Target size={12} /> Diagnóstico Rápido
                                </h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {interventionResult.analysis}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-vg-dark uppercase mb-1 flex items-center gap-1">
                                    <BookOpen size={12} /> Metodologia Sugerida
                                </h4>
                                <p className="text-sm font-bold text-vg-hover bg-vg-light/30 p-3 rounded-xl border border-vg-light">
                                    {interventionResult.methodology}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-vg-dark uppercase mb-1 flex items-center gap-1">
                                    <Sparkles size={12} /> Prática de Sala
                                </h4>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    {interventionResult.activity}
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button 
                                onClick={() => setInterventionResult(null)}
                                className="px-6 py-2 bg-vg-dark text-white rounded-xl text-xs font-bold hover:bg-vg-navy transition-colors"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
