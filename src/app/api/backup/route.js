import { db } from "@/services/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        
        const timestamp = new Date().toISOString();
        const type = body.type || 'Auto';
        const backupName = `Backup_${type}_${timestamp.split('T')[0]}_${timestamp.split('T')[1].slice(0,5).replace(':','-')}`;
        const backupId = `bkp_${Date.now()}`;

        
        const bkpSnap2 = await getDocs(collection(db, 'backups'));
        let backupsList2 = bkpSnap2.docs.map(d => d.data());
        
        if (type === 'Daily' && backupsList.some(b => b.name.startsWith(`Backup_Daily_${timestamp.split('T')[0]}`))) {
            return NextResponse.json({ success: true, message: "Already backed up today" });
        }

        // Fetch data

        const collectionsToBackup = ['exams', 'users', 'classes', 'corrections'];
        const allData = {};

        for (const colName of collectionsToBackup) {
            const snap = await getDocs(collection(db, colName));
            allData[colName] = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
        }

        // Split into chunks of 800KB to be safe
        const jsonString = JSON.stringify(allData);
        const chunkSize = 800 * 1024; // 800KB
        const chunks = [];
        for (let i = 0; i < jsonString.length; i += chunkSize) {
            chunks.push(jsonString.substring(i, i + chunkSize));
        }

        // Save metadata
        const backupRef = doc(db, 'backups', backupId);
        await setDoc(backupRef, {
            id: backupId,
            name: backupName,
            createdAt: timestamp,
            type: type,
            chunksCount: chunks.length,
            stats: {
                exams: allData.exams?.length || 0,
                users: allData.users?.length || 0,
                classes: allData.classes?.length || 0
            }
        });

        // Save chunks
        for (let i = 0; i < chunks.length; i++) {
            await setDoc(doc(db, 'backups', backupId, 'chunks', `chunk_${i}`), {
                index: i,
                data: chunks[i]
            });
        }

        // Delete older backups (Keep max 5)
        const bkpSnap = await getDocs(collection(db, 'backups'));
        let backupsList = bkpSnap.docs.map(d => d.data());
        backupsList2.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (backupsList2.length > 5) {
            const toDelete = backupsList2.slice(5);
            for (const bkp of toDelete) {
                // Delete chunks
                for (let i = 0; i < bkp.chunksCount; i++) {
                    await deleteDoc(doc(db, 'backups', bkp.id, 'chunks', `chunk_${i}`));
                }
                // Delete metadata
                await deleteDoc(doc(db, 'backups', bkp.id));
            }
        }

        return NextResponse.json({ success: true, backupId, chunks: chunks.length });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET() {
    return POST({ json: async () => ({ type: 'Cron' }) });
}
