import { db } from "@/services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const UserService = {
    // List all staff members (professors and coordinators)
    listStaff: async () => {
        try {
            // Usa a API para contornar restrições de permissão (Security Rules) do Firestore no frontend
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error("Erro na API");
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error("Error fetching staff via API:", error);
            // Fallback
            try {
                const q = query(collection(db, "users"));
                const snapshot = await getDocs(q);
                return snapshot.docs.map(doc => ({
                    uid: doc.id,
                    ...doc.data()
                }));
            } catch (fallbackError) {
                console.error("Fallback error:", fallbackError);
                return [];
            }
        }
    }
};
