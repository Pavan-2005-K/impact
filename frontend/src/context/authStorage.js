const AUTH_STORAGE_KEY = "impactlink.auth";

export function readAuthSession() {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedSession) return null;

    try {
        return JSON.parse(storedSession);
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
