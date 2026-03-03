"use client";
import { useState, useRef } from "react";
import { Camera, Upload, AlertCircle, Loader2, CheckCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ScannerPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Mock Processing
        processImage(file);
    };

    const processImage = async (file) => {
        setIsScanning(true);
        setError(null);
        setResult(null);

        // Simulate AI Delay
        setTimeout(() => {
            setIsScanning(false);
            // Mock Success Result
            setResult({
                student: "João Silva",
                score: 8.5,
                correctCount: 17,
                totalCount: 20,
                examId: "HIST-102"
            });
        }, 3000);
    };

    const triggerCamera = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-xl mx-auto">
            {/* Header Mobile Style */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Scanner de Provas
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Digitalize e corrija automaticamente.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-white/10 overflow-hidden relative min-h-[500px] flex flex-col">

                {/* Main Action Area */}
                {!imagePreview && !result && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/20 rounded-full flex items-center justify-center animate-pulse-slow">
                            <Camera size={40} className="text-indigo-600 dark:text-indigo-400" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Toque para Digitalizar</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                Aponte a câmera para o QR Code e o gabarito. Certifique-se de boa iluminação.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <button
                                onClick={triggerCamera}
                                className="btn btn-primary py-4 text-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-3"
                            >
                                <Camera size={24} />
                                Abrir Câmera
                            </button>

                            <div className="relative">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment" // Forces camera on mobile
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn btn-outline w-full py-3 border-dashed border-2 flex items-center justify-center gap-2 text-gray-500"
                                >
                                    <Upload size={18} />
                                    Carregar Arquivo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scanning State */}
                {imagePreview && isScanning && (
                    <div className="flex-1 relative flex flex-col items-center justify-center bg-black/90 z-20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />

                        <div className="text-center z-10 relative">
                            <Loader2 size={60} className="text-indigo-400 animate-spin mx-auto mb-4" />
                            <h3 className="text-white font-bold text-xl animate-pulse">Analisando Gabarito...</h3>
                            <p className="text-white/60 text-sm mt-2">IA verificando respostas...</p>
                        </div>
                    </div>
                )}

                {/* Result State */}
                {result && !isScanning && (
                    <div className="flex-1 flex flex-col">
                        <div className="bg-green-500 text-white p-6 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                                <CheckCircle size={32} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-bold">{result.score.toFixed(1)}</h2>
                            <p className="opacity-90 font-medium">Nota Final</p>
                        </div>

                        <div className="p-6 space-y-6 flex-1 bg-white dark:bg-gray-900">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/10 pb-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Aluno Identified</p>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{result.student}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Acertos</p>
                                    <p className="font-bold text-lg text-green-600">{result.correctCount}/{result.totalCount}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">Detalhes da Correção</h4>
                                <div className="grid grid-cols-5 gap-2">
                                    {Array.from({ length: 20 }).map((_, i) => (
                                        <div key={i} className={`h-2 rounded-full ${i < result.correctCount ? 'bg-green-500' : 'bg-red-400'}`}></div>
                                    ))}
                                </div>
                                <p className="text-center text-xs text-gray-400 mt-2">Visualização simplificada</p>
                            </div>

                            <button
                                onClick={() => { setImagePreview(null); setResult(null); }}
                                className="btn btn-primary w-full py-4 shadow-lg shadow-indigo-500/20"
                            >
                                Próxima Prova
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Dica: Mantenha a câmera paralela à folha. Todos os cantos do QR Code devem estar visíveis.
                </p>
            </div>
        </div>
    );
}
