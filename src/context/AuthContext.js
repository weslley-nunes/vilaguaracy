"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider, db } from "@/services/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [activeRole, setActiveRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let role = 'professor';
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        role = userDoc.data().role || 'professor';
                    }
                } catch(e) {
                    console.error("Error fetching role", e);
                }

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    role: role
                });

                // Carregar perfil ativo do localStorage ou usar o padrão
                const savedRole = localStorage.getItem(`activeRole_${firebaseUser.uid}`);
                setActiveRole(savedRole || role);
            } else {
                setUser(null);
                setActiveRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const switchRole = (newRole) => {
        if (!user) return;
        
        // Validação de permissões
        const canSwitch = 
            (user.role === 'gestao') || 
            (user.role === 'coordenador' && newRole !== 'gestao') ||
            (user.role === newRole);

        if (canSwitch) {
            setActiveRole(newRole);
            localStorage.setItem(`activeRole_${user.uid}`, newRole);
            router.push("/dashboard"); // Redireciona para o início do novo perfil
        }
    };

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            
            // Integração com banco de dados
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: result.user.email,
                    role: 'pendente',
                    name: result.user.displayName || 'Usuário Google',
                    createdAt: serverTimestamp()
                });
            }

            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const logout = async () => {
        setUser(null);
        await signOut(auth);
        router.push("/");
    };

    const emailLogin = async (email, password) => {
        try {
            let loginEmail = email.toLowerCase().trim();
            
            console.log("Tentativa de login com:", loginEmail);

            if (loginEmail === 'admin') {
                loginEmail = 'admin@vilaguaracy.com.br';
            } else {
                // Remove qualquer caractere que não seja número (pontos, traços)
                const cpfOnlyNumbers = loginEmail.replace(/\D/g, '');
                if (cpfOnlyNumbers.length === 11) {
                    loginEmail = `${cpfOnlyNumbers}@vilaguaracy.com.br`;
                    console.log("CPF detectado. Mapeado para:", loginEmail);
                }
            }

            await signInWithEmailAndPassword(auth, loginEmail, password);
            router.push("/dashboard");
        } catch (error) {
            console.error("Email login failed", error);
            throw error;
        }
    };

    const emailRegister = async (email, password) => {
        try {
            let loginEmail = email.toLowerCase().trim();
            
            if (loginEmail === 'admin') {
                loginEmail = 'admin@vilaguaracy.com.br';
            } else {
                const cpfOnlyNumbers = loginEmail.replace(/\D/g, '');
                if (cpfOnlyNumbers.length === 11) {
                    loginEmail = `${cpfOnlyNumbers}@vilaguaracy.com.br`;
                }
            }
            
            const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
            
            // Integração com banco de dados
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: loginEmail,
                role: isAdmin ? 'gestao' : 'pendente',
                name: 'Novo Usuário',
                createdAt: serverTimestamp()
            });

            router.push("/dashboard");
        } catch (error) {
            console.error("Email registration failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, activeRole, switchRole, googleLogin, emailLogin, emailRegister, logout, loading }}>
            {loading ? <div className="flex-center" style={{ height: '100vh' }}>Loading...</div> : children}
        </AuthContext.Provider>
    );
};
