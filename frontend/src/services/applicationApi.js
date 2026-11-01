import api from "./api";

export async function applyForCampaign(campaignId) {
    const response = await api.post(
        `/applications/campaigns/${encodeURIComponent(campaignId)}/apply`
    );
    return response.data;
}

export async function getMyApplications(signal) {
    const response = await api.get("/applications/my-applications", { signal });
    return response.data;
}
