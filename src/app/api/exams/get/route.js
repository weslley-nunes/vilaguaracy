import { getDb } from "@/services/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const db = getDb();
        let doc = await db.collection("exams").doc(id).get();

        // Fallback: search by 'id' field if not found by document ID
        if (!doc.exists) {
            const snapshot = await db.collection("exams").where("id", "==", id).limit(1).get();
            if (!snapshot.empty) {
                doc = snapshot.docs[0];
            }
        }

        if (!doc.exists) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        return NextResponse.json({ exam: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error("Error fetching exam:", error);
        return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
    }
}
