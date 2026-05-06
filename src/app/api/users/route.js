import { NextResponse } from "next/server";
import { getDb } from "@/services/firebase-admin";

export async function GET() {
    try {
        const db = getDb();
        const snapshot = await db.collection("users").get();
        
        const users = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users via Admin SDK:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
