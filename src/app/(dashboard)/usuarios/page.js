"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, UserPlus, Shield, GraduationCap, UserX, UserCheck, Clock, CheckCircle } from "lucide-react";
import { db } from "@/services/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function UsuariosPage() {
    const { user } = useAuth();
    const role = user?.role || "professor";
    
    const isGestao = role === "gestao";
    const isCoordenador = role === "coordenador";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "aluno" });

    useEffect(() => {
        if (!isGestao && !isCoordenador) return;

        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const usersList = [];
            snapshot.forEach((doc) => {
                usersList.push({ id: doc.id, ...doc.data() });
            });
            // Ordenar: pendentes primeiro
            usersList.sort((a, b) => {
                if (a.role === 'pendente' && b.role !== 'pendente') return -1;
                if (b.role === 'pendente' && a.role !== 'pendente') return 1;
                return 0;
            });
            setUsers(usersList);
            setLoading(false);
        }, (error) => {
            console.error("Erro ao buscar usuários:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isGestao, isCoordenador]);

    if (!isGestao && !isCoordenador) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center bg-red-50 p-8 rounded-2xl border border-red-100">
                    <Shield size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-700">Acesso Restrito</h2>
                    <p className="text-red-500 text-sm mt-2">Esta página é exclusiva para a Gestão Escolar.</p>
                </div>
            </div>
        );
    }

    const handleAddUser = (e) => {
        e.preventDefault();
        // A adição manual precisaria da cloud function de auth se fosse criar o login, 
        // mas aqui é apenas para demonstração visual neste momento. 
        // O fluxo ideal é a pessoa se cadastrar e a gestão aprovar.
        alert("Para segurança, a criação direta por aqui está desativada. Peça ao usuário para criar a conta na página de login e aprove-o nesta tela.");
        setIsAddModalOpen(false);
    };

    const handleRemoveUser = async (id, userRole) => {
        if (isCoordenador && userRole === "aluno") {
            alert("Coordenadores não têm permissão para excluir alunos.");
            return;
        }
        if (window.confirm("Deseja realmente excluir este usuário?")) {
            try {
                await deleteDoc(doc(db, "users", id));
            } catch(e) {
                console.error("Erro ao deletar:", e);
                alert("Erro ao remover usuário.");
            }
        }
    };

    const handleApproveUser = async (id) => {
        if (!isGestao) {
            alert("Apenas a gestão pode aprovar usuários.");
            return;
        }
        if (window.confirm("Aprovar este usuário como Professor?")) {
            try {
                await updateDoc(doc(db, "users", id), {
                    role: 'professor'
                });
            } catch(e) {
                console.error("Erro ao aprovar:", e);
                alert("Erro ao aprovar usuário.");
            }
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <UserCircle className="text-vg-dark" />
                        Gestão de Usuários
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Gerencie acessos, alunos e aprove novos professores.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <UserPlus size={18} /> Novo Usuário
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Nome / E-mail</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Perfil</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Carregando usuários...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Nenhum usuário encontrado.</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id} className={`transition-colors ${u.role === 'pendente' ? 'bg-orange-50/50' : 'hover:bg-gray-50/50'}`}>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{u.name || 'Sem nome'}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                                        u.role === 'gestao' ? 'bg-vg-light text-vg-navy' :
                                        u.role === 'coordenador' ? 'bg-vg-light text-vg-navy' :
                                        u.role === 'professor' ? 'bg-vg-light text-vg-hover' :
                                        u.role === 'pendente' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {u.role === 'pendente' && <Clock size={12} />}
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {u.role === 'pendente' ? (
                                        <span className="flex items-center gap-1 text-sm font-bold text-orange-500">
                                            Aguardando
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                                            <UserCheck size={16} /> Ativo
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 flex items-center justify-end gap-2">
                                    {u.role === 'pendente' && isGestao && (
                                        <button 
                                            onClick={() => handleApproveUser(u.id)}
                                            className="btn btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                                            title="Aprovar Cadastro"
                                        >
                                            <CheckCircle size={14} /> Aprovar
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleRemoveUser(u.id, u.role)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            (isCoordenador && u.role === 'aluno') 
                                                ? 'text-gray-300 cursor-not-allowed' 
                                                : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                        }`}
                                        title={(isCoordenador && u.role === 'aluno') ? "Coordenador não pode excluir aluno" : "Remover Usuário"}
                                    >
                                        <UserX size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Adição - Desativado logicamente conforme alerta, mantido visualmente caso queira expandir */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Adicionar Novo Usuário</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="p-6 text-center text-gray-600">
                                <p>Por segurança, instrua o professor a realizar o cadastro diretamente na página de Login.</p>
                                <p className="mt-2 text-sm">Ele aparecerá automaticamente na lista com o status <strong className="text-orange-500">pendente</strong> para sua aprovação.</p>
                            </div>
                            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline w-full">Entendido</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
