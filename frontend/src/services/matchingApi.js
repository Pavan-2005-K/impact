import api from "./api";

export async function getRecommendedCampaigns(signal) {
    const response = await api.get("/matching/recommended-campaigns", { signal });
    return response.data;
}

export async function getAIMatchingRecommendations(signal) {
    const response = await api.get("/matching/ai-recommendations", { signal });
    return response.data;
}
