const fs = require('fs');

const path = 'src/services/examService.js';
let code = fs.readFileSync(path, 'utf8');

const listArchived = `
    // List Archived Exams for Teacher
    listArchivedByTeacher: async (userId) => {
        if (!userId) return [];
        try {
            const q = query(
                collection(db, "exams"),
                or(
                    where("teacherId", "==", userId),
                    where("collaboratorIds", "array-contains", userId)
                )
            );
            
            const snapshot = await getDocs(q);
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(e => e.status !== "published");
            
            return exams.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA;
            });
        } catch (e) {
            console.error("Error listing archived exams", e);
            return [];
        }
    },

    // List All Archived Exams
    listAllArchived: async () => {
        try {
            const q = query(collection(db, "exams"));
            const snapshot = await getDocs(q);
            const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(e => e.status !== "published");
            
            return exams.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt || 0));
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt || 0));
                return dateB - dateA;
            });
        } catch (e) {
            console.error("Critical Error in ExamService.listAllArchived:", e);
            return [];
        }
    },
`;

code = code.replace('// List Exams for Teacher', listArchived + '\n    // List Exams for Teacher');

fs.writeFileSync(path, code, 'utf8');
console.log('Added archived methods to examService.js');
