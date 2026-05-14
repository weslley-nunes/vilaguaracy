import { getDb } from "@/services/firebase-admin";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const rawId = searchParams.get('id');

        if (!rawId) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const id = rawId.trim();

        const db = getDb();
        let docRef = await db.collection("exams").doc(id).get();
        let examData = null;
        let examId = id;

        if (docRef.exists) {
            examData = docRef.data();
        } else {
            // Fallback: search by 'shortId' or 'id' field if not found by document ID
            const shortCode = id.toUpperCase();
            const snapshot = await db.collection("exams")
                .where("shortId", "==", shortCode)
                .limit(1)
                .get();
                
            if (!snapshot.empty) {
                const docSnap = snapshot.docs[0];
                examData = docSnap.data();
                examId = docSnap.id;
            } else {
                // Broad Fallback: Fetch all exams and check suffixes manually
                const recentSnapshot = await db.collection("exams")
                    .orderBy("updatedAt", "desc")
                    .get();
                
                const found = recentSnapshot.docs.find(d => 
                    d.id.toUpperCase().endsWith(shortCode) || 
                    (d.data().id && d.data().id.toUpperCase().endsWith(shortCode))
                );

                if (found) {
                    examData = found.data();
                    examId = found.id;
                } else {
                    // Last attempt: search by full 'id' field
                    const idSnapshot = await db.collection("exams").where("id", "==", id).limit(1).get();
                    if (!idSnapshot.empty) {
                        const docSnap = idSnapshot.docs[0];
                        examData = docSnap.data();
                        examId = docSnap.id;
                    }
                }
            }
        }

        if (!examData) {
            return NextResponse.json({ error: "Exam not found" }, { status: 404 });
        }

        return NextResponse.json({ exam: { id: examId, ...examData } });
    } catch (error) {
        console.error("Error fetching exam:", error);
        return NextResponse.json({ error: `Backend Error: ${error.message}` }, { status: 500 });
    }
}
