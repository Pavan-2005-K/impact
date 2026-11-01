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
        if (
            typeof nextSession?.token !== "string" ||
            !nextSession.token ||
            !nextSession.user ||
            !["VOLUNTEER", "ORGANIZATION", "ADMIN"].includes(nextSession.user.role)
        ) {
            throw new Error("The authentication response did not contain a valid session.");
        }

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
        role: session?.user?.role ?? null,
        setSession,
        clearSession
    }), [session, setSession, clearSession]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
