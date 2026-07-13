import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, isFirebaseConfigured } from "./firebase.js";
import {
    GoogleAuthProvider, FacebookAuthProvider,
    signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    updateProfile, signOut, onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function friendlyError(e) {
    const code = (e && e.code) || "";
    const map = {
        "auth/invalid-credential": "Email o contraseña incorrectos.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/user-not-found": "No existe una cuenta con ese email.",
        "auth/email-already-in-use": "Ese email ya está registrado.",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
        "auth/popup-closed-by-user": "Has cerrado la ventana de acceso.",
        "auth/account-exists-with-different-credential":
            "Ya tienes una cuenta con ese email usando otro método de acceso.",
    };
    return map[code] || (e && e.message) || "Error de autenticación.";
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isFirebaseConfigured) { setLoading(false); return; }
        const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
        return unsub;
    }, []);

    const requireConfig = () => {
        if (!isFirebaseConfigured) {
            throw new Error("El login online no está configurado todavía. Rellena firebase.js para activarlo.");
        }
    };

    const social = useCallback(async (provider) => {
        requireConfig();
        try {
            const res = await signInWithPopup(auth, provider);
            return res.user;
        } catch (e) { throw new Error(friendlyError(e)); }
    }, []);

    const signInGoogle = useCallback(() => social(new GoogleAuthProvider()), [social]);
    const signInFacebook = useCallback(() => social(new FacebookAuthProvider()), [social]);

    const signInEmail = useCallback(async (email, password) => {
        requireConfig();
        try { return (await signInWithEmailAndPassword(auth, email, password)).user; }
        catch (e) { throw new Error(friendlyError(e)); }
    }, []);

    const registerEmail = useCallback(async (email, password, displayName) => {
        requireConfig();
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName) await updateProfile(res.user, { displayName });
            return res.user;
        } catch (e) { throw new Error(friendlyError(e)); }
    }, []);

    const logout = useCallback(async () => {
        if (!isFirebaseConfigured) return;
        await signOut(auth);
    }, []);

    const value = {
        user, loading, configured: isFirebaseConfigured,
        signInGoogle, signInFacebook, signInEmail, registerEmail, logout,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
