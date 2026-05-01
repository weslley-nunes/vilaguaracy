import { db } from "@/services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const UserService = {
    // List all staff members (professors and coordinators)
    listStaff: async () => {
        try {
            const q = query(
                collection(db, "users"),
                where("role", "in", ["professor", "coordenador", "gestao"])
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error listing staff:", error);
            return [];
        }
    }
};
