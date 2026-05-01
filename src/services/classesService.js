import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'classes';

/**
 * Cria uma nova turma para um professor
 */
export const createClass = async (userId, classData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...classData,
            userId,
            students: [], // Inicializa com array vazio de alunos
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...classData, students: [] };
    } catch (error) {
        console.error("Erro ao criar turma:", error);
        throw error;
    }
};

export const getClassesByUser = async () => {
    try {
        // Removido o filtro por userId para que todos compartilhem a mesma base de dados
        const q = query(
            collection(db, COLLECTION_NAME)
        );
        const querySnapshot = await getDocs(q);
        const classes = [];
        querySnapshot.forEach((doc) => {
            classes.push({ id: doc.id, ...doc.data() });
        });

        // Ordenação local para evitar a exigência de Compound Index no Firebase
        classes.sort((a, b) => {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
            return timeB - timeA;
        });

        return classes;
    } catch (error) {
        console.error("Erro ao buscar turmas:", error);
        throw error;
    }
};

/**
 * Atualiza os dados de uma turma (incluindo adicionar/remover alunos)
 */
export const updateClass = async (classId, updateData) => {
    try {
        const classRef = doc(db, COLLECTION_NAME, classId);
        await updateDoc(classRef, updateData);
        return true;
    } catch (error) {
        console.error("Erro ao atualizar turma:", error);
        throw error;
    }
};

/**
 * Exclui uma turma
 */
export const deleteClass = async (classId) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, classId));
        return true;
    } catch (error) {
        console.error("Erro ao excluir turma:", error);
        throw error;
    }
};
