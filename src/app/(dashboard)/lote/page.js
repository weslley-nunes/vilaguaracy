"use client";

import { useState } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, ChevronLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LotePage() {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === "application/pdf") {
            setFile(selected);
            setError(null);
        } else {
            setFile(null);
            setError("Por favor, selecione apenas um arquivo PDF.");
        }
    };

    const processBatch = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);

        try {
            // Read file as base64 to send to API
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result;
                
                try {
                    const res = await fetch("/api/corrections/batch", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            pdfData: base64Data,
                            teacherId: user?.uid
                        })
                    });

                    const data = await res.json();
                    
                    if (!res.ok) throw new Error(data.error || "Falha ao processar lote.");
                    
                    setResults(data.results);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsUploading(false);
                }
            };
            reader.onerror = () => {
                setError("Erro ao ler o arquivo PDF.");
                setIsUploading(false);
            };
        } catch (err) {
            setError(err.message);
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-vg-dark">Correção em Lote (PDF)</h1>
                    <p className="text-sm text-gray-500">Envie um arquivo PDF contendo múltiplas provas digitalizadas.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <AlertCircle size={24} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {!results && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                    {!isUploading ? (
                        <>
                            <div className="w-24 h-24 bg-vg-light/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <UploadCloud size={40} className="text-vg-dark" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Upload do Arquivo PDF</h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                Escaneie todas as provas dos seus alunos na impressora da escola em um único arquivo PDF.
                                O sistema identificará automaticamente cada aluno e fará a correção.
                            </p>
                            
                            <label className="btn btn-primary py-4 px-8 cursor-pointer inline-flex items-center gap-3 shadow-lg shadow-vg-dark/20 text-lg">
                                <FileText size={24} />
                                <span>{file ? file.name : "Selecionar Arquivo PDF"}</span>
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </label>

                            {file && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <button onClick={processBatch} className="btn bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg font-bold">
                                        Iniciar Correção em Lote
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-12">
                            <Loader2 size={64} className="text-vg-navy animate-spin mx-auto mb-6" />
                            <h3 className="font-bold text-xl text-gray-800 mb-2">A IA está processando as provas...</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Isso pode levar de alguns segundos até alguns minutos dependendo de quantas páginas existem no arquivo PDF. Por favor, aguarde e não feche esta página.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {results && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-green-50 border-b border-green-200 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={32} className="text-green-600" />
                            <div>
                                <h2 className="text-xl font-bold text-green-800">Lote Processado com Sucesso!</h2>
                                <p className="text-sm text-green-700">As notas já foram salvas no painel de Resultados.</p>
                            </div>
                        </div>
                        <button onClick={() => { setResults(null); setFile(null); }} className="btn btn-outline bg-white text-green-700 border-green-300 hover:bg-green-100">
                            Processar Novo Lote
                        </button>
                    </div>

                    <div className="p-6">
                        <h3 className="font-bold text-gray-700 mb-4">Resumo das Correções ({results.length} provas identificadas)</h3>
                        <div className="space-y-3">
                            {results.map((res, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${res.success ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'}`}>
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg">{res.studentName || "Aluno Não Identificado"}</p>
                                        <p className="text-xs text-gray-500">CÓDIGO: <span className="font-mono text-vg-dark font-bold">{res.examId || "????"}</span></p>
                                    </div>
                                    <div className="text-right">
                                        {res.success ? (
                                            <>
                                                <p className="text-3xl font-black text-vg-navy">{res.score}</p>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Nota</p>
                                            </>
                                        ) : (
                                            <p className="text-sm font-bold text-red-600 max-w-[200px]">{res.error}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
