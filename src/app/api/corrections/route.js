import { getDb } from "@/services/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { alunoId, provaId, turmaId, nota, respostasObject, maxNota } = body;

        // Validação básica
        if (!alunoId || !provaId || !turmaId) {
            return NextResponse.json({ error: "Faltam dados obrigatórios (alunoId, provaId, turmaId)" }, { status: 400 });
        }

        const db = getDb();

        const correctionData = {
            alunoId,
            provaId,
            turmaId,
            nota: Number(nota) || 0,
            maxNota: Number(maxNota) || 10,
            respostas: respostasObject || {}, // Como a IA ou OMR leu as marcações
            corrigidoEm: new Date(),
            status: "corrigido"
        };

        // Salvar na coleção corrections
        const docRef = await db.collection("corrections").add(correctionData);

        return NextResponse.json({
            success: true,
            id: docRef.id,
            message: "Correção salva com sucesso!",
            data: correctionData
        });

    } catch (error) {
        console.error("Erro ao salvar correção na API:", error);
        return NextResponse.json({
            error: "Erro interno no servidor ao salvar correção",
            details: error.message
        }, { status: 500 });
    }
}
