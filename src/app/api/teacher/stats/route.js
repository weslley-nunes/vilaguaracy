import { NextResponse } from "next/server";
import { getDb } from "@/services/firebase-admin";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");

        if (!teacherId) {
            return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
        }

        const db = getDb();
        
        // 1. Get all corrections for this teacher
        // (Assuming teacherId is stored or corrections are linked via exams)
        // For now, let's fetch all corrections and filter (or use teacherId if we have it in core)
        const correctionsSnapshot = await db.collection("corrections")
            .where("teacherId", "==", teacherId)
            .orderBy("correctedAt", "desc")
            .limit(50)
            .get();

        const corrections = correctionsSnapshot.docs.map(doc => doc.data());

        // 2. Calculate Stats
        const total = corrections.length;
        const avgScore = total > 0 
            ? corrections.reduce((acc, curr) => acc + parseFloat(curr.score), 0) / total 
            : 0;

        // 3. Aggregate Skills
        const skillsMap = {};
        corrections.forEach(corr => {
            if (corr.skills) {
                Object.entries(corr.skills).forEach(([label, stats]) => {
                    if (!skillsMap[label]) skillsMap[label] = { correct: 0, total: 0 };
                    skillsMap[label].correct += stats.correct;
                    skillsMap[label].total += stats.total;
                });
            }
        });

        const skills = Object.entries(skillsMap).map(([label, stats]) => ({
            label,
            progress: stats.correct / stats.total
        })).sort((a, b) => b.progress - a.progress);

        return NextResponse.json({
            success: true,
            total,
            avgScore: avgScore.toFixed(1),
            skills: skills.slice(0, 5), // Top 5 skills
            recentActivity: corrections.slice(0, 5).map(c => ({
                title: `Correção: ${c.studentName}`,
                subtitle: `Nota: ${c.score} | ${new Date(c.correctedAt.toDate()).toLocaleDateString()}`
            }))
        });

    } catch (error) {
        console.error("Stats fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
