"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("PAGE CRASH CAPTURED:", error);
    }, [error]);

    return (
        <div className="max-w-2xl mx-auto mt-20 bg-red-50 p-8 rounded-2xl border border-red-200 shadow-sm text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Ops! Algo deu errado aqui.</h2>
            <p className="text-red-600 mb-6">
                Ocorreu um erro interno ao tentar exibir esta página. Nossa equipe já registrou a falha.
            </p>

            <div className="bg-red-900/10 p-4 rounded-xl text-left border border-red-900/20 mb-8 overflow-auto max-h-48 text-xs font-mono text-red-900 shadow-inner">
                <span className="font-bold uppercase tracking-wider text-[10px] text-red-800 mb-1 block">Detalhes Técnicos:</span>
                {error.message || "Erro desconhecido"}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                    onClick={() => reset()}
                    className="flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
                >
                    <RefreshCcw size={18} />
                    Tentar Novamente
                </button>
                <Link
                    href="/classes"
                    className="flex justify-center items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-bold py-3 px-6 rounded-lg transition-colors shadow-sm"
                >
                    Voltar para Turmas
                </Link>
            </div>
        </div>
    );
}
