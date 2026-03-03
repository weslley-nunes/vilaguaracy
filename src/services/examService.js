import { db } from "@/services/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";

export const ExamService = {
    // Save Exam (with Fallback)
    save: async (examData, user) => {
        if (!user) throw new Error("Usuário não autenticado.");

        // 1. Sanitize Data
        const cleanData = JSON.parse(JSON.stringify({
            ...examData,
            teacherId: user.uid,
            teacherName: user.displayName || "Professor",
            createdAt: new Date(), // Client timestamp
            updatedAt: new Date(),
            status: "published",
            studentCount: 0 // Default
        }));

        // Restore Date objects (JSON.stringify converts them to strings)
        cleanData.createdAt = new Date();
        cleanData.updatedAt = new Date();

        try {
            // 2. Try Direct Firestore Write with Timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Direct write timeout")), 15000)
            );

            console.log("Attempting direct Firestore save...");
            const docRef = await Promise.race([
                addDoc(collection(db, "exams"), cleanData),
                timeoutPromise
            ]);

            console.log("Direct save success:", docRef.id);
            return { success: true, id: docRef.id, method: "direct" };
        } catch (error) {
            console.warn("Direct save failed, trying API fallback...", error.message || error);

            // 3. Fallback to API
            try {
                console.log("Attempting API fallback save...");
                const res = await fetch('/api/exams/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ examData: cleanData })
                });

                const data = await res.json();
                if (!res.ok) {
                    console.error("API Fallback Error Response:", data);
                    throw new Error(data.error || "Server error");
                }

                console.log("API fallback success:", data.id);
                return { success: true, id: data.id, method: "fallback" };
            } catch (apiError) {
                console.error("All save methods failed. Last error:", apiError.message || apiError);
                throw new Error("Não foi possível salvar a prova. Verifique sua conexão.");
            }
        }
    },

    // List Exams for Teacher
    listByTeacher: async (teacherId) => {
        if (!teacherId) return [];
        try {
            // Try ordered query first
            const q = query(
                collection(db, "exams"),
                where("teacherId", "==", teacherId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.warn("Ordered query failed (idx?), trying simple query", e);
            // Fallback: Simple query (client-side sort if needed)
            const q = query(collection(db, "exams"), where("teacherId", "==", teacherId));
            const snapshot = await getDocs(q);
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort in memory
            return exams.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        }
    },

    // Delete Exam
    delete: async (examId) => {
        await deleteDoc(doc(db, "exams", examId));
    }
};
