"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Target, Users, BookOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// Dados mockados para visualização do painel
const mockSkillsData = [
    { subject: 'EF06HI02', A: 85, B: 100, fullMark: 100, name: "Identificar Gênese" },
    { subject: 'EF06HI03', A: 45, B: 100, fullMark: 100, name: "Conceito Antiguidade" },
    { subject: 'EF07HI01', A: 90, B: 100, fullMark: 100, name: "Mundo Moderno" },
    { subject: 'EM13CHS101', A: 30, B: 100, fullMark: 100, name: "Identidade Cultural" },
    { subject: 'EM13CHS102', A: 70, B: 100, fullMark: 100, name: "Dinâmica Populacional" },
];

const mockClassData = [
    { name: '1ª Série A', EF06HI02: 80, EF06HI03: 40, EM13CHS101: 25 },
    { name: '1ª Série B', EF06HI02: 90, EF06HI03: 50, EM13CHS101: 35 },
    { name: '2ª Série A', EF06HI02: 85, EF06HI03: 45, EM13CHS101: 30 },
];

export default function HabilidadesPage() {
    const { user } = useAuth();
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

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Target className="text-vg-dark" />
                        Desempenho & Habilidades
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Análise de proficiência por habilidade (BNCC/Própria) em toda a instituição.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-vg-light px-4 py-2 rounded-xl border border-vg-light">
                        <span className="block text-[10px] uppercase font-bold text-vg-dark">Total Provas</span>
                        <span className="text-xl font-black text-vg-hover">1,245</span>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                        <span className="block text-[10px] uppercase font-bold text-green-600">Habilidades Mapeadas</span>
                        <span className="text-xl font-black text-green-700">42</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Radar de Proficiência */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target size={18} className="text-vg-dark" />
                        Radar de Proficiência Geral
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={mockSkillsData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Acertos (%)" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Tooltip />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico de Barras por Turma */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={18} className="text-vg-dark" />
                        Desempenho por Turma
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockClassData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="EF06HI02" fill="#8884d8" name="EF06HI02 (%)" />
                                <Bar dataKey="EF06HI03" fill="#82ca9d" name="EF06HI03 (%)" />
                                <Bar dataKey="EM13CHS101" fill="#ffc658" name="EM13CHS101 (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Alertas de Habilidades Críticas */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-orange-50/50">
                    <h3 className="font-bold text-orange-800 flex items-center gap-2">
                        <BookOpen size={18} className="text-orange-500" />
                        Atenção: Habilidades com Baixo Desempenho
                    </h3>
                    <p className="text-sm text-orange-600 mt-1">Habilidades com índice de acerto abaixo de 50% nas avaliações recentes.</p>
                </div>
                <div className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Código / Habilidade</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Turma Crítica</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Acertos</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Ação Recomendada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockSkillsData.filter(s => s.A < 50).map((skill, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800">{skill.subject}</div>
                                        <div className="text-xs text-gray-500">{skill.name}</div>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-gray-600">1ª Série A</td>
                                    <td className="p-4">
                                        <span className="inline-flex px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                                            {skill.A}%
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-sm text-vg-dark font-bold hover:underline">Solicitar Revisão</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Controle de Professores Pendentes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Users size={18} className="text-gray-500" />
                        Status de Envio de Provas
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-green-100 bg-green-50 rounded-xl">
                        <h4 className="font-bold text-green-800 text-sm mb-2 uppercase tracking-wide">Enviaram Avaliações</h4>
                        <ul className="space-y-2 text-sm text-green-700">
                            <li className="flex items-center justify-between"><span>Carlos (Matemática)</span><CheckCircle className="w-4 h-4" /></li>
                            <li className="flex items-center justify-between"><span>Ana (Biologia)</span><CheckCircle className="w-4 h-4" /></li>
                        </ul>
                    </div>
                    <div className="p-4 border border-orange-100 bg-orange-50 rounded-xl">
                        <h4 className="font-bold text-orange-800 text-sm mb-2 uppercase tracking-wide">Pendentes</h4>
                        <ul className="space-y-2 text-sm text-orange-700">
                            <li className="flex items-center justify-between"><span>Roberto (Física)</span><span className="text-xs font-bold">Falta Enviar</span></li>
                            <li className="flex items-center justify-between"><span>Maria (História)</span><span className="text-xs font-bold">Falta Enviar</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Aux icon
function CheckCircle({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    )
}
