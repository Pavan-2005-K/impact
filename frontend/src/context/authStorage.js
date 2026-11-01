const AUTH_STORAGE_KEY = "impactlink.auth";
const AUTH_ROLES = ["VOLUNTEER", "ORGANIZATION", "ADMIN"];

export function readAuthSession() {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedSession) return null;

    try {
        const session = JSON.parse(storedSession);
        if (
            typeof session?.token === "string" &&
            session.token &&
            session.user &&
            AUTH_ROLES.includes(session.user.role)
        ) {
            return session;
        }

        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    } catch {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

export function writeAuthSession(session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
