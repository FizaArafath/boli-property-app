"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { mockLoginApi } from "@/lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false); // true once localStorage has been read

  // localStorage only exists in the browser, so read it after mount
  useEffect(() => {
    setToken(localStorage.getItem("token"));
    try { setUser(JSON.parse(localStorage.getItem("user"))); } catch { setUser(null); }
    setReady(true);
  }, []);

  const login = async (username, password) => {
    const res = await mockLoginApi(username, password); // throws on bad credentials
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, ready, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
