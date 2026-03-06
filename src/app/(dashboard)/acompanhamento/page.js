"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Presentation, AlertCircle } from 'lucide-react';

export default function AcompanhamentoPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Dados Mockados para inicializar o Dashboard de Acompanhamento visualmente
    const mockDesempenhoTurmas = [
        { name: '1º Ano A', media: 7.5, max: 10, min: 4 },
        { name: '1º Ano B', media: 8.2, max: 10, min: 5 },
        { name: '2º Ano A', media: 6.8, max: 9.5, min: 3 },
        { name: '3º Ano Médio', media: 8.9, max: 10, min: 6 },
    ];

    const mockEvolucaoMensal = [
        { mes: 'Fev', mediaGeral: 6.5 },
        { mes: 'Mar', mediaGeral: 7.2 },
        { mes: 'Abr', mediaGeral: 7.8 },
        { mes: 'Mai', mediaGeral: 7.5 },
        { mes: 'Jun', mediaGeral: 8.3 },
    ];

    if (!mounted) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Acompanhamento de Desempenho
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                    Visualize os resultados das avaliações corrigidas pela IA e acompanhe suas turmas.
                </p>
            </header>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Média Geral"
                    value="7.8"
                    subtitle="+0.5 em relação ao mês anterior"
                    icon={TrendingUp}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
                <StatCard
                    title="Provas Corrigidas"
                    value="342"
                    subtitle="Neste semestre"
                    icon={Presentation}
                    color="text-indigo-500"
                    bg="bg-indigo-500/10"
                />
                <StatCard
                    title="Alunos Avaliados"
                    value="128"
                    subtitle="Ativos na plataforma"
                    icon={Users}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    title="Atenção Necessária"
                    value="3 Turmas"
                    subtitle="Média abaixo de 7.0"
                    icon={AlertCircle}
                    color="text-rose-500"
                    bg="bg-rose-500/10"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Turmas Performance Chart */}
                <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Desempenho por Turma</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={mockDesempenhoTurmas}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#8884d8" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#8884d8" />
                                <YAxis domain={[0, 10]} stroke="#8884d8" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="media" name="Média da Turma" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Evolution Chart */}
                <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Evolução da Média Geral (Meses)</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={mockEvolucaoMensal}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.2} />
                                <XAxis dataKey="mes" stroke="#10b981" />
                                <YAxis domain={[0, 10]} stroke="#10b981" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="mediaGeral" name="Média Geral" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500 bg-gray-100 dark:bg-white/5 p-4 rounded-xl">
                Nota: Estes dados dependem do aplicativo de câmera para serem alimentados em tempo real com as correções.
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, color, bg }) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-gray-800 dark:text-white block">{value}</h3>
                    <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
            </div>
        </div>
    );
}
