import { getRecommendedCampaigns } from "./matchingApi";

export async function getVolunteerCampaigns(signal) {
    const response = await getRecommendedCampaigns(signal);
    if (!Array.isArray(response?.recommendations)) {
        throw new Error("The campaign response was not in the expected format.");
    }

    return {
        campaigns: response.recommendations,
        count: Number.isInteger(response.count) && response.count >= 0
            ? response.count
            : null
    };
}
