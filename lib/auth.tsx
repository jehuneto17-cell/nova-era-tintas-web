"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { criarCliente, subscribeCliente } from "./clientes";
import type { Cliente } from "./types";

type AuthValue = {
  user: User | null;
  cliente: Cliente | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  cadastrar: (
    nome: string,
    email: string,
    senha: string,
    telefone: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedUid, setLoadedUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const uid = user?.uid ?? null;
  if (uid !== loadedUid) {
    setLoadedUid(uid);
    setCliente(null);
  }

  useEffect(() => {
    if (!user) return;
    return subscribeCliente(user.uid, setCliente);
  }, [user]);

  const value: AuthValue = {
    user,
    cliente,
    loading,
    login: async (email, senha) => {
      await signInWithEmailAndPassword(auth, email, senha);
    },
    cadastrar: async (nome, email, senha, telefone) => {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      await criarCliente(cred.user.uid, { nome, email, telefone });
    },
    logout: async () => {
      await signOut(auth);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
