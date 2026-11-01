import api from "./api";

export async function login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
}

export async function registerVolunteer(details) {
    const response = await api.post("/auth/register/volunteer", details);
    return response.data;
}

export async function registerOrganization(details) {
    const response = await api.post("/auth/register/organization", details);
    return response.data;
}

export function getAuthErrorMessage(error, fallback) {
    if (typeof error.response?.data?.message === "string") {
        return error.response.data.message;
    }

    if (error.request && !error.response) {
        return "We couldn’t reach ImpactLink. Check your connection and try again.";
    }

    return fallback;
}
