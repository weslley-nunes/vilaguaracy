"use client";
import { useState, useEffect, useRef } from "react";
import { Camera, ChevronLeft, Loader2, CheckCircle, Save, XCircle, FileText, PenTool } from "lucide-react";
import Link from "next/link";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState(null); // The raw data from QR code
    const [examData, setExamData] = useState(null); // Fetched exam from DB
    const [isLoadingExam, setIsLoadingExam] = useState(false);
    
    // Interactive Grid State: questionIndex -> string (selected option A, B, C, D, E)
    const [studentAnswers, setStudentAnswers] = useState({});
    const [correctionMode, setCorrectionMode] = useState(null); // 'ai' | 'manual'
    const [isProcessingAi, setIsProcessingAi] = useState(false);
    const [manualEntry, setManualEntry] = useState({ id: '', s: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Initialize Scanner on load
    useEffect(() => {
        // 1. Check for URL Parameters (for direct links from QR codes)
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');
        const urlS = urlParams.get('s');
        const urlC = urlParams.get('c');
        const urlAc = urlParams.get('ac');

        if (urlId && urlS) {
            if (!scanResult) {
                const data = { id: urlId, s: urlS, c: urlC, ac: urlAc };
                setScanResult(data);
                fetchExam(urlId);
            }
            return; // Don't start scanner if we already have data
        }

        if (scanResult) return; // Stop scanning if we have a result

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(
            (decodedText) => {
                try {
                    let data;
                    if (decodedText.startsWith('http')) {
                        // Handle URL format
                        const url = new URL(decodedText);
                        data = {
                            id: url.searchParams.get('id'),
                            s: url.searchParams.get('s'),
                            c: url.searchParams.get('c'),
                            ac: url.searchParams.get('ac')
                        };
                    } else {
                        // Handle Legacy JSON format
                        data = JSON.parse(decodedText);
                    }

                    if (data.id && data.s) {
                        scanner.clear();
                        setScanResult(data);
                        fetchExam(data.id);
                    } else {
                        setError("QR Code inválido. Não contém dados suficientes.");
                    }
                } catch (e) {
                    setError("QR Code no formato incorreto ou link inválido.");
                }
            },
            (errorMessage) => {
                // Ignore background scanning errors
            }
        );

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, [scanResult]);

    const fetchExam = async (examId) => {
        setIsLoadingExam(true);
        setError(null);
        try {
            const res = await fetch(`/api/exams/get?id=${examId}`);
            if (!res.ok) throw new Error("Prova não encontrada no banco de dados.");
            const data = await res.json();
            setExamData(data.exam);
            
            // Auto-fill answers with empty state
            const initialAnswers = {};
            data.exam.questions.forEach((_, idx) => {
                initialAnswers[idx] = null;
            });
            setStudentAnswers(initialAnswers);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingExam(false);
        }
    };

    const handleBubbleClick = (qIndex, option) => {
        setStudentAnswers(prev => ({
            ...prev,
            [qIndex]: prev[qIndex] === option ? null : option // Toggle selection
        }));
    };

    const submitCorrection = async () => {
        if (!examData || !scanResult) return;
        setIsSaving(true);
        
        let correctCount = 0;
        const details = [];

        examData.questions.forEach((q, idx) => {
            const studentAns = studentAnswers[idx];
            // Format correct answer for robust comparison (Fallback to answerKey if q.correct is missing)
            const baseCorrect = q.correct || (examData.answerKey && examData.answerKey[idx]);
            const correctStr = String(baseCorrect || "").trim();
            
            const cleanCorrect = correctStr.length === 1 
                ? correctStr.toUpperCase() 
                : correctStr.replace(/^[a-zA-Z\d]+[).:-]\s*/, "").toUpperCase();
            
            const isCorrect = studentAns === cleanCorrect || studentAns === correctStr.toUpperCase();
            
            if (isCorrect) correctCount++;
            
            details.push({
                questionIndex: idx,
                habilidade: q.habilidade || "N/A",
                subject: q.subject || "Geral",
                isCorrect,
                studentAnswer: studentAns || null,
                correctAnswer: cleanCorrect || correctStr
            });
        });

        const totalCount = examData.questions.length;
        const rawScore = examData.totalScore || 10;
        const score = (correctCount / totalCount) * rawScore;

        const payload = {
            examId: examData.id,
            studentName: scanResult.s,
            classId: scanResult.c || "Geral",
            score,
            correctCount,
            totalCount,
            details,
            answers: studentAnswers
        };

        try {
            const res = await fetch("/api/corrections/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Falha ao salvar correção");
            
            setCorrectionResult({
                score,
                correctCount,
                totalCount
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setExamData(null);
        setCorrectionResult(null);
        setStudentAnswers({});
        setCorrectionMode(null);
        setError(null);
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-vg-dark">Scanner de Correção</h1>
                    <p className="text-sm text-gray-500">Leia o QR Code para identificar o aluno e a prova.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center justify-between">
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="text-red-800"><XCircle size={20}/></button>
                </div>
            )}

            {!scanResult && !isLoadingExam && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                    <div className="p-6 text-center border-b border-gray-100">
                        <Camera size={40} className="text-vg-navy mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Aponte a Câmera</h3>
                        <p className="text-sm text-gray-500 mb-6">Enquadre o QR Code impresso no cabeçalho da prova do aluno.</p>
                        
                        {/* Scanner Div */}
                        <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-dashed border-gray-300"></div>
                    </div>
                    
                    {/* Manual Entry Fallback */}
                    <div className="p-6 bg-gray-50">
                        <h4 className="font-bold text-sm text-gray-700 mb-4 text-center">QR Code Ilegível? Digite Manualmente:</h4>
                        <div className="max-w-sm mx-auto space-y-3">
                            <input 
                                type="text" 
                                placeholder="CÓDIGO da Prova (ex: A3B9F2)" 
                                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-vg-dark uppercase text-center font-mono"
                                value={manualEntry.id}
                                onChange={(e) => setManualEntry({...manualEntry, id: e.target.value.toUpperCase()})}
                            />
                            <input 
                                type="text" 
                                placeholder="Nome do Aluno" 
                                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-vg-dark text-center"
                                value={manualEntry.s}
                                onChange={(e) => setManualEntry({...manualEntry, s: e.target.value})}
                            />
                            <button 
                                disabled={!manualEntry.id || !manualEntry.s}
                                onClick={() => {
                                    setScanResult(manualEntry);
                                    fetchExam(manualEntry.id);
                                }}
                                className="w-full btn btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Iniciar Correção
                            </button>
                        </div>
                    </div>
                    
                    {/* Batch Mode Link */}
                    <div className="p-6 bg-vg-light/10 border-t border-gray-100 text-center">
                        <h4 className="font-bold text-sm text-gray-700 mb-3">Tem várias provas em um único PDF?</h4>
                        <Link href="/lote" className="btn btn-outline border-vg-dark text-vg-dark hover:bg-vg-dark hover:text-white py-2 px-6 inline-flex items-center gap-2">
                            <FileText size={18} />
                            Acessar Correção em Lote
                        </Link>
                    </div>
                </div>
            )}

            {isLoadingExam && (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                    <Loader2 size={40} className="text-vg-navy animate-spin mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-gray-800">Baixando Prova...</h3>
                    <p className="text-gray-500 text-sm">O sistema identificou o aluno. Buscando o gabarito oficial...</p>
                </div>
            )}

            {examData && !correctionResult && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-vg-light border-b border-vg-dark p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-vg-dark">{scanResult.s}</h2>
                                <p className="text-sm text-gray-700 font-medium">Turma: {scanResult.c || "N/A"}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold">Avaliação ID</p>
                                <p className="font-mono text-sm">{scanResult.id.slice(-6)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {!correctionMode ? (
                            <div className="space-y-4 text-center py-8">
                                <h3 className="font-bold text-gray-700 mb-4">Como deseja realizar a correção?</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setCorrectionMode('ai')}
                                        className="p-6 border-2 border-vg-dark rounded-2xl hover:bg-vg-light transition-all flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-12 h-12 bg-vg-dark text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Camera size={24} />
                                        </div>
                                        <span className="font-bold text-vg-dark">Foto do Gabarito (IA)</span>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Correção Automática</p>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setCorrectionMode('manual')}
                                        className="p-6 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all flex flex-col items-center gap-3 group"
                                    >
                                        <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Save size={24} />
                                        </div>
                                        <span className="font-bold text-gray-700">Lançamento Manual</span>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Toque para Marcar</p>
                                    </button>
                                </div>
                                <button onClick={resetScanner} className="text-sm text-gray-400 hover:underline mt-4 block mx-auto">Escanear outro aluno</button>
                            </div>
                        ) : correctionMode === 'ai' ? (
                            <div className="space-y-6 text-center py-4">
                                <div className="bg-vg-light/30 p-6 rounded-2xl border-2 border-dashed border-vg-dark">
                                    <Camera size={48} className="text-vg-dark mx-auto mb-4" />
                                    <h3 className="font-bold text-lg text-vg-dark mb-2">Correção Automática</h3>
                                    <p className="text-xs text-gray-600 mb-6">Tire uma foto ou envie um PDF da página inteira da prova.</p>
                                    
                                    <label className="btn btn-primary py-4 px-8 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-vg-dark/30">
                                        <Camera size={20} />
                                        <span>Tirar Foto / Enviar PDF</span>
                                        <input 
                                            type="file" 
                                            accept="image/*,application/pdf" 
                                            capture="environment" 
                                            className="hidden" 
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                
                                                setIsAIProcessing(true);
                                                setError(null);
                                                
                                                try {
                                                    const reader = new FileReader();
                                                    reader.readAsDataURL(file);
                                                    reader.onload = async () => {
                                                        const base64 = reader.result;
                                                        const res = await fetch("/api/corrections/process", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({
                                                                examId: examData.id,
                                                                studentName: scanResult.s,
                                                                image: base64
                                                            })
                                                        });
                                                        
                                                        const result = await res.json();
                                                        if (result.error) throw new Error(result.error);
                                                        
                                                        setCorrectionResult({
                                                            score: Number(result.score),
                                                            correctCount: result.results.filter(r => r.isCorrect).length,
                                                            totalCount: examData.questions.length
                                                        });
                                                    };
                                                } catch (err) {
                                                    setError("Erro na IA: " + err.message);
                                                } finally {
                                                    setIsAIProcessing(false);
                                                }
                                            }}
                                        />
                                    </label>
                                    
                                    {isAIProcessing && (
                                        <div className="mt-6 flex flex-col items-center gap-2">
                                            <Loader2 size={24} className="animate-spin text-vg-dark" />
                                            <p className="text-xs font-bold text-vg-dark animate-pulse">A IA está corrigindo a prova...</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setCorrectionMode(null)} className="text-sm text-gray-400 hover:underline">Voltar</button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 flex justify-between items-center bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
                                    <div>
                                        <h3 className="font-bold text-yellow-800">Lançamento de Respostas</h3>
                                        <p className="text-xs text-yellow-700">Toque nas bolinhas correspondentes ao que o aluno marcou no papel.</p>
                                    </div>
                                    <button onClick={() => setCorrectionMode(null)} className="text-xs font-bold text-yellow-600 underline">Mudar Modo</button>
                                </div>

                        {/* Interactive Answer Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
                            {examData.questions.map((q, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg border-b border-gray-100 pb-3">
                                    <span className="font-bold text-gray-400 w-6 text-right">{idx + 1}.</span>
                                    <div className="flex gap-2">
                                        {['A', 'B', 'C', 'D', 'E'].map(opt => {
                                            // Only render options that exist in the question (usually 4)
                                            // Assuming standard 4 or 5 options. Let's just render 4 if not specified, or 5 if there's E.
                                            const hasOption = q.options && q.options.length >= (opt.charCodeAt(0) - 64);
                                            if (!hasOption && opt === 'E') return null; // Hide E if only 4 options

                                            const isSelected = studentAnswers[idx] === opt;
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleBubbleClick(idx, opt)}
                                                    className={`w-8 h-8 rounded-full border-2 font-bold text-sm flex items-center justify-center transition-all ${
                                                        isSelected 
                                                            ? 'bg-vg-navy border-vg-navy text-white shadow-md transform scale-110' 
                                                            : 'bg-white border-gray-300 text-gray-500 hover:border-vg-navy hover:text-vg-navy'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-gray-300 ml-auto">{q.subject || "Geral"}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setCorrectionMode(null)} className="btn btn-outline py-3 flex-1 text-gray-600 border-gray-300">Cancelar</button>
                            <button onClick={submitCorrection} disabled={isSaving} className="btn btn-primary py-3 flex-1 flex items-center justify-center gap-2 shadow-lg shadow-vg-dark/30">
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Salvar Correção
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )}

            {correctionResult && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-center">
                    <div className="bg-green-500 text-white p-8">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle size={32} className="text-white" />
                        </div>
                        <h2 className="text-5xl font-bold mb-2">{correctionResult.score.toFixed(1)}</h2>
                        <p className="opacity-90 font-medium text-lg">Nota Final de {scanResult.s}</p>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-center gap-12 mb-8 border-b border-gray-100 pb-8">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Acertos</p>
                                <p className="text-3xl font-bold text-green-600">{correctionResult.correctCount}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Erros</p>
                                <p className="text-3xl font-bold text-red-500">{correctionResult.totalCount - correctionResult.correctCount}</p>
                            </div>
                        </div>

                        <button onClick={resetScanner} className="btn btn-primary py-4 w-full text-lg shadow-lg shadow-vg-dark/20">
                            Escanear Próximo Aluno
                        </button>
                        
                        <div className="mt-6">
                            <Link href="/dashboard/resultados" className="text-sm font-bold text-vg-dark hover:underline">
                                Ver Boletim Analítico Completo
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
