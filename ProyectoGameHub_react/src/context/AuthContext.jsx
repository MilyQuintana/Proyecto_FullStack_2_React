import { createContext, useContext, useMemo, useState } from "react";
import { gamehubApi } from "../services/gamehubApi";

const KEY = "gamehub_sesion";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem(KEY) || "null"));
  const login = async (email, password) => {
    const next = await gamehubApi.login(email, password);
    setSession(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  };
  const logout = () => { setSession(null); localStorage.removeItem(KEY); };
  const value = useMemo(() => ({ session, login, logout, token: session?.token, rol: session?.rol }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
