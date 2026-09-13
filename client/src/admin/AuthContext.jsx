import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminApi, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  // checking | signed-in | signed-out
  const [status, setStatus] = useState(() => (getToken() ? "checking" : "signed-out"));

  useEffect(() => {
    if (status !== "checking") return undefined;
    let cancelled = false;
    adminApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setAdmin(me);
        setStatus("signed-in");
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
        setStatus("signed-out");
      });
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Any 401 from the API (expired session, removed admin) signs out everywhere.
  useEffect(() => {
    const onUnauthorized = () => {
      setAdmin(null);
      setStatus("signed-out");
    };
    window.addEventListener("admin:unauthorized", onUnauthorized);
    return () => window.removeEventListener("admin:unauthorized", onUnauthorized);
  }, []);

  const signIn = useCallback(async (email, password) => {
    const res = await adminApi.login(email, password);
    setToken(res.token);
    setAdmin(res.admin);
    setStatus("signed-in");
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setAdmin(null);
    setStatus("signed-out");
  }, []);

  const value = useMemo(() => ({ admin, status, signIn, signOut }), [admin, status, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
