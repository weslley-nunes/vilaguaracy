"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/services/firebase";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";
import { Trash2, UserPlus, Download } from "lucide-react";

export default function ClassesPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [newStudentName, setNewStudentName] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "students"), where("teacherId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!newStudentName.trim() || !user) return;
        setLoading(true);
        try {
            await addDoc(collection(db, "students"), {
                name: newStudentName,
                teacherId: user.uid,
                createdAt: new Date(),
            });
            setNewStudentName("");
        } catch (error) {
            console.error("Error adding student:", error);
            alert("Erro ao adicionar aluno. Verifique se você configurou o Firebase corretamente.");
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (confirm("Tem certeza que deseja remover este aluno?")) {
            await deleteDoc(doc(db, "students", id));
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Minhas Turmas</h1>
                    <p className="text-gray-500">Gerencie seus alunos e seus códigos de identificação.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Student Form */}
                <div className="card h-fit lg:col-span-1">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-indigo-600" />
                        Novo Aluno
                    </h2>
                    <form onSubmit={handleAddStudent}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                placeholder="Ex: Ana Silva"
                                className="w-full border-gray-300"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary"
                        >
                            {loading ? "Adicionando..." : "Cadastrar Aluno"}
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {students.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                            <p className="text-gray-500">Nenhum aluno cadastrado ainda.</p>
                        </div>
                    ) : (
                        students.map((student) => (
                            <div key={student.id} className="card flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded border border-gray-100">
                                        <QRCodeSVG
                                            id={`qr-${student.id}`}
                                            value={student.id}
                                            size={64}
                                            level="M"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{student.name}</h3>
                                        <p className="text-xs text-gray-400 font-mono">ID: {student.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => downloadQR(student.id, student.name)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Baixar QR Code"
                                    >
                                        <Download size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(student.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
