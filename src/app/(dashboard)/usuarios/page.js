"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserCircle, UserPlus, Shield, GraduationCap, UserX, UserCheck } from "lucide-react";
// Importações Firebase omitidas para brevidade na UI, devem ser implementadas com admin SDK no backend ou funções
// Para essa interface, vamos mockar a visualização para que a Gestão possa ver como funciona.

export default function UsuariosPage() {
    const { user } = useAuth();
    const role = user?.role || "professor";
    
    const isGestao = role === "gestao";
    const isCoordenador = role === "coordenador";

    const [users, setUsers] = useState([
        { id: "1", name: "Maria Silva", email: "maria@vilaguaracy.com.br", role: "professor", status: "ativo" },
        { id: "2", name: "João Pedro", email: "joao@vilaguaracy.com.br", role: "coordenador", status: "ativo" },
        { id: "3", name: "Ana Beatriz", email: "ana@escola.com", role: "aluno", status: "ativo" },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "aluno" });

    // Se for professor comum, ele teoricamente nem acessaria a página pois o link foi removido,
    // mas se acessar pela URL, mostramos "Acesso Negado".
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
        setUsers([...users, { ...newUser, id: Date.now().toString(), status: "ativo" }]);
        setIsAddModalOpen(false);
        setNewUser({ name: "", email: "", role: "aluno" });
    };

    const handleRemoveUser = (id, userRole) => {
        if (isCoordenador && userRole === "aluno") {
            alert("Coordenadores não têm permissão para excluir alunos.");
            return;
        }
        if (window.confirm("Deseja realmente excluir este usuário?")) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <UserCircle className="text-indigo-600" />
                        Gestão de Usuários
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Gerencie acessos, alunos e professores do Vila Guaracy.</p>
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
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-800">{u.name}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                                        u.role === 'gestao' ? 'bg-purple-100 text-purple-700' :
                                        u.role === 'coordenador' ? 'bg-blue-100 text-blue-700' :
                                        u.role === 'professor' ? 'bg-indigo-100 text-indigo-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1 text-sm font-bold text-green-600">
                                        <UserCheck size={16} /> Ativo
                                    </span>
                                </td>
                                <td className="p-4 text-right">
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

            {/* Modal de Adição */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Adicionar Novo Usuário</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                                    <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                                    <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Perfil de Acesso</label>
                                    <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full p-3 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none">
                                        <option value="aluno">Aluno</option>
                                        <option value="professor">Professor</option>
                                        <option value="coordenador">Coordenador de Área</option>
                                        {isGestao && <option value="gestao">Gestão Escolar</option>}
                                    </select>
                                </div>
                            </div>
                            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline">Cancelar</button>
                                <button type="submit" className="btn btn-primary">Cadastrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
