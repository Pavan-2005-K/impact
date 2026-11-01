import api from "./api";

export async function getMyGroups(signal) {
    const response = await api.get("/groups/my-group", { signal });
    return response.data;
}
