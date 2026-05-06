import { getDb } from "@/services/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const examId = searchParams.get('examId');
        
        const db = getDb();
        let query = db.collection("corrections");
        
        if (examId) {
            query = query.where("examId", "==", examId);
        }

        const snapshot = await query.orderBy("createdAt", "desc").get();
        
        const corrections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        return NextResponse.json({ corrections });
    } catch (error) {
        console.error("Error fetching corrections:", error);
        return NextResponse.json({ error: "Failed to fetch corrections" }, { status: 500 });
    }
}
