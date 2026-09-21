const fs = require('fs');

const path = 'src/app/(dashboard)/builder/page.js';
let code = fs.readFileSync(path, 'utf8');

// 1. Add updateDoc to firestore import
code = code.replace(
    'import { collection, addDoc, getDocs, limit, query, deleteDoc, doc } from "firebase/firestore";',
    'import { collection, addDoc, getDocs, limit, query, deleteDoc, doc, updateDoc } from "firebase/firestore";'
);

// 2. Fix handleExportQuestion
const oldFunc = `    const handleExportQuestion = async () => {
        if (!selectedTargetExam) return;
        setIsExporting(true);
        try {
            const targetExam = await ExamService.getById(selectedTargetExam);
            if (targetExam) {
                const newQuestion = { ...exportQuestionTarget, id: Date.now() + Math.random(), ownerId: user.uid };
                const updatedQuestions = [...(targetExam.questions || []), newQuestion];
                
                const { doc, updateDoc } = await import('firebase/firestore');
                const docRef = doc(db, "exams", targetExam.id);
                await updateDoc(docRef, { questions: updatedQuestions });
                
                alert("Questão exportada com sucesso!");
                setIsExportModalOpen(false);
                setSelectedTargetExam("");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao exportar questão.");
        } finally {
            setIsExporting(false);
        }
    };`;

const newFunc = `    const handleExportQuestion = async () => {
        if (!selectedTargetExam) return;
        setIsExporting(true);
        try {
            const targetExam = await ExamService.getById(selectedTargetExam);
            if (targetExam) {
                const newQuestion = { ...exportQuestionTarget, id: Date.now() + Math.random(), ownerId: user.uid };
                const updatedQuestions = [...(targetExam.questions || []), newQuestion];
                
                const docRef = doc(db, "exams", targetExam.id);
                await updateDoc(docRef, { questions: updatedQuestions });
                
                alert("Questão transferida com sucesso para a prova de destino!");
                setIsExportModalOpen(false);
                setSelectedTargetExam("");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao exportar questão: " + error.message);
        } finally {
            setIsExporting(false);
        }
    };`;

if (code.includes(oldFunc)) {
    code = code.replace(oldFunc, newFunc);
} else {
    // try replacing dynamically
    code = code.replace("const { doc, updateDoc } = await import('firebase/firestore');", "");
    code = code.replace("alert(\"Questo exportada com sucesso!\");", "alert(\"Questão transferida com sucesso para a prova de destino!\");");
    code = code.replace("alert(\"Erro ao exportar questo.\");", "alert(\"Erro ao exportar questão: \" + error.message);");
}

fs.writeFileSync(path, code, 'utf8');
console.log('Fixed export function');
