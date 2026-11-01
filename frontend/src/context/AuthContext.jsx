import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./authContextInstance";
import {
    clearStoredAuthSession,
    readAuthSession,
    writeAuthSession
} from "./authStorage";

export function AuthProvider({ children }) {
    const [session, setSessionState] = useState(readAuthSession);

    const setSession = useCallback(nextSession => {
        writeAuthSession(nextSession);
        setSessionState(nextSession);
    }, []);

    const clearSession = useCallback(() => {
        clearStoredAuthSession();
        setSessionState(null);
    }, []);

    const value = useMemo(() => ({
        session,
        token: session?.token ?? null,
        user: session?.user ?? null,
        role: session?.role ?? session?.user?.role ?? null,
        setSession,
        clearSession
    }), [session, setSession, clearSession]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
