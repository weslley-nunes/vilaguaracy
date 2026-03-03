import { getDb } from "@/services/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { examData } = body;

        if (!examData) {
            return NextResponse.json({ error: "Missing exam data" }, { status: 400 });
        }

        // Force a simplified data structure to ensure no undefined values
        // (Server-side generic validation)
        const cleanData = JSON.parse(JSON.stringify(examData));

        // Ensure timestamp is a Date object (serialized as string in JSON)
        if (cleanData.createdAt) {
            cleanData.createdAt = new Date(cleanData.createdAt);
        } else {
            cleanData.createdAt = new Date();
        }

        // Use Admin SDK (db.collection().add())
        const db = getDb();
        const docRef = await db.collection("exams").add(cleanData);

        return NextResponse.json({ success: true, id: docRef.id });
    } catch (error) {
        console.error("API Save Error (Admin SDK):", error);
        console.log("Detailed Error:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        if (body) {
            console.log("Request Body (truncated):", JSON.stringify(body).substring(0, 1000));
        }
        return NextResponse.json({
            error: error.message,
            details: error.code || "UNKNOWN_ERROR"
        }, { status: 500 });
    }
}
