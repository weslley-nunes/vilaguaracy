import { getDb } from "@/services/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { examId, studentName, classId, score, correctCount, totalCount, details, answers, teacherId } = body;

        if (!examId || !studentName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const db = getDb();
        
        const correctionData = {
            examId,
            studentName,
            classId: classId || "Geral",
            score,
            correctCount,
            totalCount,
            details, // Array of { questionIndex, correct, habilidade }
            answers, // The actual answers marked by the teacher/student
            teacherId: teacherId || null,
            createdAt: new Date(),
        };

        const docRef = await db.collection("corrections").add(correctionData);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("API Correction Save Error:", error);
        return NextResponse.json({ error: "Failed to save correction" }, { status: 500 });
    }
}
