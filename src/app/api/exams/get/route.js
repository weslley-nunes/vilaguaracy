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
        const doc = await db.collection("exams").doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        return NextResponse.json({ exam: { id: doc.id, ...doc.data() } });
    } catch (error) {
        console.error("Error fetching exam:", error);
        return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
    }
}
