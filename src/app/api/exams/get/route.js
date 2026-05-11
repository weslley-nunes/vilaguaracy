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

        // Fallback: search by 'shortId' or 'id' field if not found by document ID
        if (!doc.exists) {
            const shortCode = id.toUpperCase();
            const snapshot = await db.collection("exams")
                .where("shortId", "==", shortCode)
                .limit(1)
                .get();
                
            if (!snapshot.empty) {
                doc = snapshot.docs[0];
            } else {
                // Broad Fallback: Fetch last 50 exams and check suffixes manually
                // This helps find older exams that haven't been resaved with shortId yet.
                const recentSnapshot = await db.collection("exams")
                    .orderBy("updatedAt", "desc")
                    .limit(50)
                    .get();
                
                const found = recentSnapshot.docs.find(d => 
                    d.id.toUpperCase().endsWith(shortCode) || 
                    (d.data().id && d.data().id.toUpperCase().endsWith(shortCode))
                );

                if (found) {
                    doc = found;
                } else {
                    // Last attempt: search by full 'id' field
                    const idSnapshot = await db.collection("exams").where("id", "==", id).limit(1).get();
                    if (!idSnapshot.empty) {
                        doc = idSnapshot.docs[0];
                    }
                }
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
