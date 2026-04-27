import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, nowTs } from "../services/firebase";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setProfile(null);

      if (!u) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, {
            email: u.email || "",
            role: "user",
            name: "",
            bio: "",
            createdAt: nowTs(),
            updatedAt: nowTs()
          }, { merge: true });
        }

        const snap2 = await getDoc(ref);
        setProfile(snap2.exists() ? { uid: u.uid, ...snap2.data() } : null);
      } catch (e) {
        setProfile({ uid: u.uid, email: u.email || "", role: "user", name: "", bio: "" });
        console.error("Auth profile load failed:", e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
  }), [user, profile, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
