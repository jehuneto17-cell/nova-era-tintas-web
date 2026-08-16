"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { criarCliente, getCliente, subscribeCliente } from "./clientes";
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
  loginComGoogle: () => Promise<void>;
  loginComApple: () => Promise<void>;
  logout: () => Promise<void>;
};

async function garantirCliente(uid: string, nome: string, email: string) {
  const existente = await getCliente(uid);
  if (!existente) {
    await criarCliente(uid, { nome, email, telefone: "" });
  }
}

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
    loginComGoogle: async () => {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      await garantirCliente(cred.user.uid, cred.user.displayName ?? "", cred.user.email ?? "");
    },
    loginComApple: async () => {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");
      const cred = await signInWithPopup(auth, provider);
      await garantirCliente(cred.user.uid, cred.user.displayName ?? "", cred.user.email ?? "");
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
