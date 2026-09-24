"use client";
import { useState, useEffect } from "react";
import { db } from "@/services/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Database, Download, RotateCcw, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

export default function BackupPage() {
    const { user, activeRole } = useAuth();
    const [backups, setBackups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (activeRole === 'gestao') {
            loadBackups();
        }
    }, [activeRole]);

    const loadBackups = async () => {
        try {
            const snap = await getDocs(collection(db, 'backups'));
            const list = snap.docs.map(d => d.data());
            list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBackups(list);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Erro ao carregar backups." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setIsProcessing(true);
        setMessage({ type: 'info', text: "Gerando backup... Isso pode levar alguns segundos." });
        try {
            const res = await fetch('/api/backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'Manual' })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: "Backup gerado com sucesso!" });
                loadBackups();
            } else {
                throw new Error(data.error || "Erro desconhecido");
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Falha ao gerar backup: " + error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRestore = async (backup) => {
        if (!confirm(`TEM CERTEZA? Isso irá sobrescrever as provas, usuários e turmas com os dados de ${new Date(backup.createdAt).toLocaleString()}.`)) return;
        
        setIsProcessing(true);
        setMessage({ type: 'info', text: "Baixando dados do backup..." });
        
        try {
            // Fetch chunks
            let jsonString = "";
            for (let i = 0; i < backup.chunksCount; i++) {
                const chunkSnap = await getDocs(collection(db, 'backups', backup.id, 'chunks'));
                const chunkDoc = chunkSnap.docs.find(d => d.data().index === i);
                if (chunkDoc) jsonString += chunkDoc.data().data;
            }

            if (!jsonString) throw new Error("Dados do backup não encontrados ou corrompidos.");

            setMessage({ type: 'info', text: "Restaurando banco de dados (pode demorar)..." });
            const allData = JSON.parse(jsonString);

            // Restore collections
            const collections = ['exams', 'users', 'classes', 'corrections'];
            for (const col of collections) {
                if (allData[col] && Array.isArray(allData[col])) {
                    for (const item of allData[col]) {
                        const id = item._id;
                        delete item._id;
                        await setDoc(doc(db, col, id), item);
                    }
                }
            }

            setMessage({ type: 'success', text: "Backup restaurado com sucesso! Recarregue a página." });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Erro ao restaurar: " + error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    if (activeRole !== 'gestao') {
        return <div className="p-8 text-center text-red-500">Acesso negado. Apenas a Gestão pode acessar esta área.</div>;
    }

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                        <Database className="text-vg-dark" size={32} />
                        Sistema de Backup
                    </h1>
                    <p className="text-gray-500 mt-2">Gerencie e recupere o banco de dados do sistema (Máximo 5 backups armazenados).</p>
                </div>
                <button 
                    onClick={handleCreateBackup}
                    disabled={isProcessing}
                    className="btn btn-primary px-6 flex items-center gap-2"
                >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    Fazer Backup Agora
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 font-bold ${message.type === 'error' ? 'bg-red-100 text-red-700' : message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}}>
                    {message.type === 'error' ? <AlertTriangle size={20} /> : message.type === 'success' ? <CheckCircle size={20} /> : <Loader2 size={20} className="animate-spin" />}
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Data e Hora</th>
                            <th className="px-6 py-4">Nome do Arquivo</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Provas</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400">
                                    <Loader2 size={24} className="animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : backups.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">Nenhum backup encontrado no sistema.</td>
                            </tr>
                        ) : (
                            backups.map((bkp) => (
                                <tr key={bkp.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                                        {new Date(bkp.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                        {bkp.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${bkp.type === 'Auto' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}}>
                                            {bkp.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-bold">
                                        {bkp.stats?.exams || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleRestore(bkp)}
                                            disabled={isProcessing}
                                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-colors text-sm flex items-center gap-2 ml-auto"
                                        >
                                            <RotateCcw size={16} /> Recuperar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
