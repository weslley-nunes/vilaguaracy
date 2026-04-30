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
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            
            // Integração com banco de dados
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: result.user.email,
                    role: 'professor',
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
            const loginEmail = email.toLowerCase() === 'admin' ? 'admin@vilaguaracy.com.br' : email;
            await signInWithEmailAndPassword(auth, loginEmail, password);
            router.push("/dashboard");
        } catch (error) {
            console.error("Email login failed", error);
            throw error;
        }
    };

    const emailRegister = async (email, password) => {
        try {
            const isAdmin = email.toLowerCase() === 'admin';
            const loginEmail = isAdmin ? 'admin@vilaguaracy.com.br' : email;
            
            const userCredential = await createUserWithEmailAndPassword(auth, loginEmail, password);
            
            // Integração com banco de dados
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: loginEmail,
                role: isAdmin ? 'gestao' : 'professor',
                createdAt: serverTimestamp()
            });

            router.push("/dashboard");
        } catch (error) {
            console.error("Email registration failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, googleLogin, emailLogin, emailRegister, logout, loading }}>
            {loading ? <div className="flex-center" style={{ height: '100vh' }}>Loading...</div> : children}
        </AuthContext.Provider>
    );
};
