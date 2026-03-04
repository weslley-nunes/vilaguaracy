"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getClassesByUser, updateClass } from "@/services/classesService";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Download, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export default function ClassDetailsPage() {
    const { id: classId } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStudentName, setNewStudentName] = useState("");
    const [newStudentEnrollment, setNewStudentEnrollment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Bulk add state
    const [addMode, setAddMode] = useState("single"); // 'single' | 'bulk'
    const [bulkStudents, setBulkStudents] = useState("");

    useEffect(() => {
        if (!user || !classId) return;

        const fetchClassDetails = async () => {
            setLoading(true);
            try {
                // To save reads, we can fetch all and find, or just fetch the specific doc if we had a getById
                // Doing the safest way: finding it in the user's classes
                const allUserClasses = await getClassesByUser(user.uid);
                const currentClass = allUserClasses.find(c => c.id === classId);

                if (currentClass) {
                    setClassData(currentClass);
                } else {
                    alert("Turma não encontrada.");
                    router.push("/classes");
                }
            } catch (error) {
                console.error("Erro ao carregar detalhes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClassDetails();
    }, [user, classId, router]);

    const generateAccessCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusable I, O, 0, 1
        let code = '';
        for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    };

    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            let newStudentsList = [];

            if (addMode === "single") {
                if (!newStudentName.trim() || !classData) {
                    setIsSubmitting(false);
                    return;
                }
                newStudentsList.push({
                    id: generateId(),
                    accessCode: generateAccessCode(),
                    name: newStudentName.trim(),
                    enrollment: newStudentEnrollment.trim() || "",
                    addedAt: new Date().toISOString()
                });
            } else {
                if (!bulkStudents.trim() || !classData) {
                    setIsSubmitting(false);
                    return;
                }

                const lines = bulkStudents.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                if (lines.length === 0) {
                    setIsSubmitting(false);
                    return;
                }

                newStudentsList = lines.map(name => ({
                    id: generateId(),
                    accessCode: generateAccessCode(),
                    name: name,
                    enrollment: "",
                    addedAt: new Date().toISOString()
                }));
            }

            const updatedStudents = [...(classData.students || []), ...newStudentsList];

            await updateClass(classId, { students: updatedStudents });

            setClassData({ ...classData, students: updatedStudents });
            setNewStudentName("");
            setNewStudentEnrollment("");
            setBulkStudents("");
        } catch (error) {
            console.error(error);
            alert("Erro ao adicionar aluno(s).");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (confirm("Deseja realmente remover este aluno da turma?")) {
            try {
                const updatedStudents = classData.students.filter(s => s.id !== studentId);
                await updateClass(classId, { students: updatedStudents });
                setClassData({ ...classData, students: updatedStudents });
            } catch (error) {
                alert("Erro ao remover aluno.");
            }
        }
    };

    const downloadQR = (id, name) => {
        const svg = document.getElementById(`qr-${id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `QR-${name.replace(/\s+/g, '_')}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="text-center py-10">Carregando detalhes da turma...</div>;
    if (!classData) return null;

    const students = classData.students || [];

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <Link href="/classes" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Voltar para turmas
                </Link>
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
                        <p className="text-gray-500 mt-1">{classData.school}</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm">
                        <Users size={20} className="text-indigo-500" />
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total de Alunos</p>
                            <p className="text-xl font-bold text-gray-900 leading-none">{students.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form to add student */}
                <div className="card h-fit lg:col-span-1 shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <UserPlus size={20} className="text-indigo-600" />
                            Novo Cadastro
                        </h2>
                    </div>

                    {/* Add Mode Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                        <button
                            type="button"
                            onClick={() => setAddMode("single")}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${addMode === 'single' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Individual
                        </button>
                        <button
                            type="button"
                            onClick={() => setAddMode("bulk")}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${addMode === 'bulk' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Em Lote (Lista)
                        </button>
                    </div>

                    <form onSubmit={handleAddStudent} className="space-y-4">
                        {addMode === "single" ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                                    <input
                                        type="text"
                                        value={newStudentName}
                                        onChange={(e) => setNewStudentName(e.target.value)}
                                        placeholder="Ex: Maria Luiza Silva"
                                        className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        required={addMode === "single"}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula (Opcional)</label>
                                    <input
                                        type="text"
                                        value={newStudentEnrollment}
                                        onChange={(e) => setNewStudentEnrollment(e.target.value)}
                                        placeholder="Ex: 2024001"
                                        className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lista de Nomes (1 por linha) *</label>
                                <textarea
                                    value={bulkStudents}
                                    onChange={(e) => setBulkStudents(e.target.value)}
                                    placeholder="João da Silva&#10;Maria Santos&#10;Pedro Alves"
                                    className="w-full h-32 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                                    required={addMode === "bulk"}
                                ></textarea>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {bulkStudents.split('\n').filter(l => l.trim()).length} alunos detectados
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn btn-primary flex justify-center items-center gap-2 mt-2"
                        >
                            {isSubmitting ? "Adicionando..." : (addMode === "single" ? "Adicionar Aluno" : "Importar Lista")}
                        </button>
                    </form>
                </div>

                {/* List of students in this class */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-lg text-gray-800">Lista de Chamada</h2>
                    </div>

                    {students.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                            <Users size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">Esta turma ainda não possui alunos.</p>
                            <p className="text-sm text-gray-400 mt-1">Adicione o primeiro aluno usando o formulário ao lado.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Desktop Table Header */}
                            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-2 sm:col-span-1 text-center">QR</div>
                                <div className="col-span-10 sm:col-span-5">Aluno & Código</div>
                                <div className="col-span-4 sm:col-span-3">Matrícula</div>
                                <div className="col-span-1 sm:col-span-3 text-right">Ações</div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {students.map((student) => (
                                    <div key={student.id || Math.random().toString()} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">

                                        {/* QR Code */}
                                        <div className="sm:col-span-1 flex justify-start sm:justify-center">
                                            <div className="bg-white p-1.5 rounded border border-gray-200 shrink-0 shadow-sm">
                                                <QRCodeSVG
                                                    id={`qr-${student.id}`}
                                                    value={String(student.id)}
                                                    size={48}
                                                    level="L"
                                                    includeMargin={false}
                                                />
                                            </div>
                                        </div>

                                        {/* Name & Mobile ID info */}
                                        <div className="sm:col-span-5">
                                            <h3 className="font-bold text-gray-900 truncate" title={student.name}>{student.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-indigo-700 font-bold tracking-widest bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200" title="Código de Acesso">
                                                    {student.accessCode || String(student.id).substring(0, 6).toUpperCase()}
                                                </span>
                                                {/* Mobile only enrollment */}
                                                {student.enrollment && (
                                                    <span className="sm:hidden text-xs text-gray-500">
                                                        Matrícula: {student.enrollment}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Desktop Enrollment */}
                                        <div className="hidden sm:block sm:col-span-3">
                                            <span className="text-sm text-gray-600">
                                                {student.enrollment || <span className="text-gray-400 italic">Não informada</span>}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2 sm:col-span-3">
                                            <button
                                                onClick={() => downloadQR(student.id, student.name)}
                                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-indigo-100"
                                                title="Baixar Cartão QR"
                                            >
                                                <Download size={18} />
                                                <span className="sr-only">Baixar</span>
                                            </button>
                                            <button
                                                onClick={() => handleRemoveStudent(student.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center border border-transparent hover:border-red-100"
                                                title="Remover Aluno"
                                            >
                                                <Trash2 size={18} />
                                                <span className="sr-only">Remover</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
