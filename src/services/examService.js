import { db } from "@/services/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc, or } from "firebase/firestore";

export const ExamService = {
    // Save Exam (with Fallback)
    save: async (examData, user) => {
        if (!user) throw new Error("Usuário não autenticado.");

        // 1. Sanitize Data
        const cleanData = JSON.parse(JSON.stringify({
            ...examData,
            teacherId: user.uid,
            teacherName: user.displayName || "Professor",
            collaborators: examData.collaborators || [], // Objetos {userId, subject, quota}
            collaboratorIds: (examData.collaborators || []).map(c => c.userId), // IDs para busca
            createdAt: new Date(),
            updatedAt: new Date(),
            status: "published",
            studentCount: 0
        }));

        // Restore Date objects
        cleanData.createdAt = new Date();
        cleanData.updatedAt = new Date();

        try {
            const docRef = await addDoc(collection(db, "exams"), cleanData);
            return { success: true, id: docRef.id, method: "direct" };
        } catch (error) {
            console.error("Direct save failed", error);
            throw error;
        }
    },

    // List All Exams (For Management/Coordination)
    listAll: async () => {
        try {
            const q = query(collection(db, "exams"));
            const snapshot = await getDocs(q);
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Ordenação manual (createdAt) para as mais novas aparecerem primeiro
            return exams.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0));
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0));
                return dateB - dateA;
            });
        } catch (e) {
            console.error("Critical Error in ExamService.listAll:", e);
            return [];
        }
    },

    // List Exams for Teacher (Owned + Collaborations)
    listByTeacher: async (userId) => {
        if (!userId) return [];
        try {
            // Busca provas onde o usuário é dono OU é colaborador (via array de IDs)
            const q = query(
                collection(db, "exams"),
                or(
                    where("teacherId", "==", userId),
                    where("collaboratorIds", "array-contains", userId)
                )
            );
            
            const snapshot = await getDocs(q);
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Ordenação manual (createdAt)
            return exams.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });
        } catch (e) {
            console.error("Error listing exams", e);
            return [];
        }
    },

    // Update Collaborators
    updateCollaborators: async (examId, collaborators) => {
        const docRef = doc(db, "exams", examId);
        await updateDoc(docRef, {
            collaborators: collaborators,
            updatedAt: new Date()
        });
    },

    // Delete Exam
    delete: async (examId) => {
        await deleteDoc(doc(db, "exams", examId));
    }
};
