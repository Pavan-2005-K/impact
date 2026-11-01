import api from "./api";

export async function getVolunteerDashboard(signal) {
    const response = await api.get("/dashboard/volunteer", { signal });
    return response.data;
}
