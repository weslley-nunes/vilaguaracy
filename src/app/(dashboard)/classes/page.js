"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClass, getClassesByUser, deleteClass, updateClass } from "@/services/classesService";
import { Users, Plus, Trash2, FolderOpen, Edit2, X } from "lucide-react";
import Link from "next/link";

export default function ClassesPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [newClassName, setNewClassName] = useState("");
    const [newClassSchool, setNewClassSchool] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingClassId, setEditingClassId] = useState(null);

    // Initial load states
    const [localClasses, setLocalClasses] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const data = await getClassesByUser(); // Removido user.uid para pegar todas
                setLocalClasses(data);
            } catch (error) {
                console.error("Erro ao carregar turmas", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newClassName.trim() || !user) return;

        setIsSubmitting(true);
        try {
            if (editingClassId) {
                await updateClass(editingClassId, {
                    name: newClassName,
                    school: newClassSchool || "Não informada",
                });
                setLocalClasses(localClasses.map(c =>
                    c.id === editingClassId ? { ...c, name: newClassName, school: newClassSchool || "Não informada" } : c
                ));
                cancelEdit();
            } else {
                const newClass = await createClass(user.uid, {
                    name: newClassName,
                    school: newClassSchool || "Não informada",
                });
                setLocalClasses([newClass, ...localClasses]);
                cancelEdit();
            }
        } catch (error) {
            alert(editingClassId ? "Erro ao salvar alterações da turma." : "Erro ao criar turma. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const startEdit = (classItem) => {
        setEditingClassId(classItem.id);
        setNewClassName(classItem.name);
        setNewClassSchool(classItem.school === "Não informada" ? "" : classItem.school);
    };

    const cancelEdit = () => {
        setEditingClassId(null);
        setNewClassName("");
        setNewClassSchool("");
    };

    const handleDelete = async (classId) => {
        if (confirm("Tem certeza que deseja apagar esta turma e todos os seus alunos?")) {
            try {
                await deleteClass(classId);
                setLocalClasses(localClasses.filter(c => c.id !== classId));
                if (editingClassId === classId) cancelEdit();
            } catch (error) {
                alert("Erro ao deletar turma");
            }
        }
    };

    if (loading) return <div className="text-center py-10">Carregando turmas...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Turmas da Unidade</h1>
                    <p className="text-gray-500">Base de dados compartilhada de alunos e turmas.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to create/edit class */}
                <div className="card h-fit lg:col-span-1 border-2 border-transparent transition-colors duration-300">
                    <h2 className="font-bold text-lg mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {editingClassId ? <Edit2 size={20} className="text-vg-dark" /> : <Plus size={20} className="text-vg-dark" />}
                            {editingClassId ? "Editar Turma" : "Nova Turma"}
                        </div>
                        {editingClassId && (
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Cancelar Edição">
                                <X size={18} />
                            </button>
                        )}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Turma *</label>
                            <input
                                type="text"
                                value={newClassName}
                                onChange={(e) => setNewClassName(e.target.value)}
                                placeholder="Ex: 3º Ano B"
                                className={`w-full border-gray-300 rounded-md focus:ring-vg-dark focus:border-vg-dark ${editingClassId ? 'bg-vg-light/30' : ''}`}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Escola / Instituição</label>
                            <input
                                type="text"
                                value={newClassSchool}
                                onChange={(e) => setNewClassSchool(e.target.value)}
                                placeholder="Ex: Colégio Estadual"
                                className={`w-full border-gray-300 rounded-md focus:ring-vg-dark focus:border-vg-dark ${editingClassId ? 'bg-vg-light/30' : ''}`}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full btn flex justify-center items-center gap-2 ${editingClassId ? 'bg-vg-dark hover:bg-vg-hover text-white' : 'btn-primary'}`}
                        >
                            {isSubmitting ? "Salvando..." : (editingClassId ? "Salvar Alterações" : "Criar Turma")}
                        </button>
                    </form>
                </div>

                {/* List of Classes */}
                <div className="lg:col-span-2 space-y-4">
                    {localClasses.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="font-bold text-gray-900 mb-1">Nenhuma turma criada</h3>
                            <p className="text-sm text-gray-500">Crie sua primeira turma ao lado para começar a adicionar alunos.</p>
                        </div>
                    ) : (
                        localClasses.map((classItem) => (
                            <div key={classItem.id} className={`card p-0 overflow-hidden transition-all duration-300 ${editingClassId === classItem.id ? 'ring-2 ring-vg-dark shadow-md' : 'hover:border-vg-light'}`}>
                                <div className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${editingClassId === classItem.id ? 'bg-vg-dark text-white' : 'bg-vg-light text-vg-dark'} transition-colors`}>
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{classItem.name}</h3>
                                            <p className="text-sm text-gray-500">{classItem.school}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {classItem.students?.length || 0} alunos
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                                    <Link
                                        href={`/classes/${classItem.id}`}
                                        className="text-sm font-medium text-vg-dark hover:text-vg-hover"
                                    >
                                        Gerenciar Alunos →
                                    </Link>
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={() => startEdit(classItem)}
                                            className="p-1.5 text-gray-500 hover:text-vg-dark hover:bg-vg-light rounded transition-colors flex items-center gap-1 text-sm border border-transparent hover:border-vg-light"
                                            title="Editar Turma"
                                        >
                                            <Edit2 size={16} />
                                            <span className="sr-only sm:not-sr-only sm:text-xs font-medium">Editar</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(classItem.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1 text-sm border border-transparent hover:border-red-200"
                                            title="Apagar Turma"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
