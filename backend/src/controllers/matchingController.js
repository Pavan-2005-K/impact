
const {
    getRecommendedCampaigns,
    getCampaignVolunteerMatches
} = require("../services/matchingService");

const { generateAIResponse } = require("../services/groqService");
const { redisClient } = require("../config/redis");

const MATCHING_CACHE_TTL = 300;

const getCachedMatching = async (key) => {
    try {
        if (!redisClient.isReady) return null;

        const cached = await redisClient.get(key);

        if (cached) {
            console.log(`Redis MATCHING CACHE HIT: ${key}`);
            return JSON.parse(cached);
        }

        console.log(`Redis MATCHING CACHE MISS: ${key}`);
        return null;
    } catch (error) {
        console.error("Matching cache read error:", error.message);
        return null;
    }
};

const setCachedMatching = async (key, data) => {
    try {
        if (!redisClient.isReady) return;

        await redisClient.setEx(
            key,
            MATCHING_CACHE_TTL,
            JSON.stringify(data)
        );

        console.log(`Redis MATCHING CACHE SAVED: ${key}`);
    } catch (error) {
        console.error("Matching cache write error:", error.message);
    }
};

// Volunteer dashboard recommendations
const getVolunteerRecommendations = async (req, res) => {
    try {
        const cacheKey = `matching:volunteer:${req.user.userId}`;

        let recommendations = await getCachedMatching(cacheKey);

        if (recommendations === null) {
            recommendations = await getRecommendedCampaigns(req.user.userId);

            if (recommendations !== null) {
                await setCachedMatching(cacheKey, recommendations);
            }
        }

        if (recommendations === null) {
            return res.status(404).json({
                message: "Volunteer profile not found or account inactive"
            });
        }

        res.json({
            message: "Campaign recommendations generated successfully",
            count: recommendations.length,
            matchingWeights: {
                skills: "40%",
                location: "30%",
                availability: "20%",
                performance: "10%"
            },
            recommendations
        });

    } catch (error) {
        console.error("Volunteer recommendations error:", error);

        res.status(500).json({
            message: "Unable to generate campaign recommendations"
        });
    }
};


// AI-powered volunteer matching assistant
const getAIMatchingRecommendations = async (req, res) => {
    try {
        // Get recommendations from our existing matching algorithm
        const cacheKey = `matching:volunteer:${req.user.userId}`;

        let recommendations = await getCachedMatching(cacheKey);

        if (recommendations === null) {
            recommendations = await getRecommendedCampaigns(req.user.userId);

            if (recommendations !== null) {
                await setCachedMatching(cacheKey, recommendations);
            }
        }

        if (recommendations === null) {
            return res.status(404).json({
                success: false,
                message: "Volunteer profile not found or account inactive"
            });
        }

        if (recommendations.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No upcoming campaigns are currently available.",
                data: {
                    recommendations: [],
                    aiExplanation:
                        "There are no published upcoming campaigns to recommend right now. Please check again later."
                }
            });
        }

        // Send only the top five recommendations to the AI.
        // Do not send volunteer email addresses or unnecessary personal data.
        const topRecommendations = recommendations.slice(0, 5);

        const safeRecommendations = topRecommendations.map((item) => ({
            campaign: {
                title: item.campaign.title,
                description: item.campaign.description,
                category: item.campaign.category,
                city: item.campaign.city,
                state: item.campaign.state,
                startDate: item.campaign.start_date,
                endDate: item.campaign.end_date,
                requiredSkills: (item.campaign.skills || []).map(
                    skill => skill.name
                )
            },
            matchScore: item.matchScore,
            scoreBreakdown: item.breakdown,
            matchedSkills: item.matchedSkills,
            distanceKm: item.distanceKm,
            averageRating: item.averageRating,
            totalRatings: item.totalRatings
        }));

        const systemPrompt = `
You are ImpactLink's AI-powered Volunteer Matching Assistant.

Your task is to explain campaign recommendations to volunteers.

IMPORTANT RULES:
1. Use only the campaign and matching information supplied to you.
2. Never invent campaign details, skills, dates, locations or benefits.
3. Match scores are calculated by the backend. Never change or recalculate them.
4. Explain why each campaign matches the volunteer.
5. Mention missing skill matches or availability concerns only when supported by the supplied data.
6. A performance score of 50 with zero ratings means there is no rating history; do not describe it as a poor rating.
7. If distance is null, do not invent a distance.
8. Do not claim that a volunteer is confirmed or accepted into a campaign.
9. Use simple, friendly language.
10. Suggest that the volunteer review campaign details before applying.

Format your answer with:
- A short introduction.
- The best matching campaigns in ranking order.
- A brief explanation for each campaign.
- One useful suggestion for the volunteer.
`;

        const aiExplanation = await generateAIResponse(
            JSON.stringify(safeRecommendations, null, 2),
            systemPrompt
        );

        return res.status(200).json({
            success: true,
            message: "AI matching recommendations generated successfully",
            data: {
                matchingWeights: {
                    skills: "40%",
                    location: "30%",
                    availability: "20%",
                    performance: "10%"
                },
                recommendations: safeRecommendations,
                aiExplanation
            }
        });

    } catch (error) {
        console.error("AI matching error:", error);
        console.error("Underlying cause:", error.cause);

        return res.status(502).json({
            success: false,
            message: "Unable to generate AI matching recommendations."
        });
    }
};


// Organization dashboard: ranked volunteers for a campaign
const getOrganizationVolunteerMatches = async (req, res) => {
    const campaignId = Number(req.params.campaignId);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
        return res.status(400).json({
            message: "Invalid campaign ID"
        });
    }

    try {
        const result = await getCampaignVolunteerMatches(
            campaignId,
            req.user.userId
        );

        if (!result) {
            return res.status(404).json({
                message: "Campaign not found, not published, or not available"
            });
        }

        res.json({
            message: "Volunteer matches generated successfully",
            ...result
        });

    } catch (error) {
        console.error("Organization volunteer matching error:", error);

        res.status(500).json({
            message: "Unable to generate volunteer matches"
        });
    }
};

module.exports = {
    getVolunteerRecommendations,
    getAIMatchingRecommendations,
    getOrganizationVolunteerMatches
};
