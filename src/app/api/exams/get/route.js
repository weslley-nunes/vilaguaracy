import { db } from "@/services/firebase";
import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const rawId = searchParams.get('id');

        if (!rawId) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const id = rawId.trim();

        let docSnapshot = await getDoc(doc(db, "exams", id));
        let examData = null;
        let examId = id;

        if (docSnapshot.exists()) {
            examData = docSnapshot.data();
        } else {
            // Fallback: search by 'shortId' or 'id' field if not found by document ID
            const shortCode = id.toUpperCase();
            const qShort = query(collection(db, "exams"), where("shortId", "==", shortCode));
            const snapshot = await getDocs(qShort);
                
            if (!snapshot.empty) {
                docSnapshot = snapshot.docs[0];
                examData = docSnapshot.data();
                examId = docSnapshot.id;
            } else {
                // Broad Fallback: Fetch all exams and check suffixes manually
                const qRecent = query(collection(db, "exams"), orderBy("updatedAt", "desc"));
                const recentSnapshot = await getDocs(qRecent);
                
                const found = recentSnapshot.docs.find(d => 
                    d.id.toUpperCase().endsWith(shortCode) || 
                    (d.data().id && d.data().id.toUpperCase().endsWith(shortCode))
                );

                if (found) {
                    docSnapshot = found;
                    examData = docSnapshot.data();
                    examId = docSnapshot.id;
                } else {
                    // Last attempt: search by full 'id' field
                    const qId = query(collection(db, "exams"), where("id", "==", id));
                    const idSnapshot = await getDocs(qId);
                    if (!idSnapshot.empty) {
                        docSnapshot = idSnapshot.docs[0];
                        examData = docSnapshot.data();
                        examId = docSnapshot.id;
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
        return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
    }
}
