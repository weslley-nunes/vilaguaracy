import { db } from "@/services/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc, or, getDoc } from "firebase/firestore";

export const ExamService = {
    // Save Exam (with Fallback)
    save: async (examData, user) => {
        if (!user) throw new Error("Usuário não autenticado.");

        // 1. Sanitize Data
        const cleanData = JSON.parse(JSON.stringify({
            ...examData,
            teacherId: user.uid,
            teacherName: user.displayName || "Professor",
            collaborators: (examData.collaborators || []).map(c => ({
                ...c,
                current: (examData.questions || []).filter(q => q.ownerId === c.userId).length
            })), // Objetos {userId, subject, quota, current}
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
            if (cleanData.id) {
                const docId = cleanData.id;
                delete cleanData.id;
                delete cleanData.createdAt; // Mantém a data de criação original
                // Ensure shortId is present even on updates
                cleanData.shortId = docId.slice(-6).toUpperCase();
                await updateDoc(doc(db, "exams", docId), cleanData);
                return { success: true, id: docId, method: "update" };
            } else {
                const docRef = await addDoc(collection(db, "exams"), cleanData);
                // Update with its own ID and shortId for easier lookup
                await updateDoc(docRef, { 
                    id: docRef.id, 
                    shortId: docRef.id.slice(-6).toUpperCase() 
                });
                return { success: true, id: docRef.id, method: "direct" };
            }
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
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(e => e.bimester === "2º Bimestre");
            
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
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(e => e.bimester === "2º Bimestre");
            
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

    // Get by ID (with robust fallbacks)
    getById: async (examId) => {
        if (!examId) return null;
        try {
            const cleanId = String(examId).trim();
            const docRef = doc(db, "exams", cleanId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            }

            // Fallback 1: Search by shortId
            const shortCode = cleanId.toUpperCase();
            const qShort = query(collection(db, "exams"), where("shortId", "==", shortCode));
            const shortSnap = await getDocs(qShort);
            if (!shortSnap.empty) {
                return { id: shortSnap.docs[0].id, ...shortSnap.docs[0].data() };
            }

            // Fallback 2: Search older exams by partial match
            const qRecent = query(collection(db, "exams"), orderBy("updatedAt", "desc"));
            const recentSnap = await getDocs(qRecent);
            const found = recentSnap.docs.find(d => 
                d.id.toUpperCase().endsWith(shortCode) || 
                (d.data().id && d.data().id.toUpperCase().endsWith(shortCode))
            );

            if (found) {
                return { id: found.id, ...found.data() };
            }

            // Fallback 3: Strict 'id' field search
            const qId = query(collection(db, "exams"), where("id", "==", cleanId));
            const idSnap = await getDocs(qId);
            if (!idSnap.empty) {
                return { id: idSnap.docs[0].id, ...idSnap.docs[0].data() };
            }

            return null;
        } catch (e) {
            console.error("Error getting exam by id", e);
            return null;
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

    // List Corrections for an Exam
    listCorrectionsByExam: async (examId) => {
        if (!examId) return [];
        try {
            const q = query(
                collection(db, "corrections"),
                where("examId", "==", examId)
            );
            const snapshot = await getDocs(q);
            const corrections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Ordenação manual por data decrescente
            return corrections.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
        } catch (e) {
            console.error("Error listing corrections", e);
            return [];
        }
    },

    // List All Corrections (Global for management)
    listAllCorrections: async () => {
        try {
            const q = query(collection(db, "corrections"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("Error listing all corrections", e);
            return [];
        }
    },

    // Delete Exam
    delete: async (examId) => {
        await deleteDoc(doc(db, "exams", examId));
    }
};
