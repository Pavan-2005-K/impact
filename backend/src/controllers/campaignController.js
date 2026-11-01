
const pool = require("../config/db");
const { redisClient } = require("../config/redis");
const {
    invalidateDashboardCache,
    invalidateAllMatchingCaches
} = require("../services/cacheService");

const CACHE_TTL = 300;

// Get cached campaign data
const getCachedCampaigns = async (key) => {
    try {
        if (!redisClient.isReady) return null;

        const cachedData = await redisClient.get(key);

        if (cachedData) {
            console.log(`Redis CAMPAIGN CACHE HIT: ${key}`);
            return JSON.parse(cachedData);
        }

        console.log(`Redis CAMPAIGN CACHE MISS: ${key}`);
        return null;

    } catch (error) {
        console.error("Campaign cache read error:", error.message);
        return null;
    }
};

// Save campaign data in Redis
const setCachedCampaigns = async (key, data) => {
    try {
        if (!redisClient.isReady) return;

        await redisClient.setEx(
            key,
            CACHE_TTL,
            JSON.stringify(data)
        );

        console.log(`Redis CAMPAIGN CACHE SAVED: ${key}`);

    } catch (error) {
        console.error("Campaign cache write error:", error.message);
    }
};

// Invalidate an organization's campaign cache
const invalidateCampaignCache = async (organizationId) => {
    try {
        if (!redisClient.isReady) return;

        const key = `campaigns:organization:${organizationId}`;

        await redisClient.del(key);

        console.log(`Redis CAMPAIGN CACHE INVALIDATED: ${key}`);

    } catch (error) {
        console.error("Campaign cache invalidation error:", error.message);
    }
};


// Create a campaign
const createCampaign = async (req, res) => {
    const {
        title,
        description,
        category,
        requiredVolunteers,
        maxVolunteers,
        location,
        city,
        state,
        latitude,
        longitude,
        startDate,
        endDate,
        skills = []
    } = req.body;

    if (
        !title ||
        !description ||
        !category ||
        !requiredVolunteers ||
        !maxVolunteers ||
        !location ||
        !startDate ||
        !endDate
    ) {
        return res.status(400).json({
            message: "Please provide all required campaign details"
        });
    }

    if (
        !Number.isInteger(requiredVolunteers) ||
        !Number.isInteger(maxVolunteers) ||
        requiredVolunteers <= 0 ||
        maxVolunteers < requiredVolunteers
    ) {
        return res.status(400).json({
            message: "Volunteer capacity must be at least the required volunteer count"
        });
    }

    if (!Array.isArray(skills)) {
        return res.status(400).json({
            message: "Skills must be an array of skill IDs"
        });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
    ) {
        return res.status(400).json({
            message: "Please provide valid campaign dates. End date must be after start date."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const campaignResult = await client.query(
            `INSERT INTO campaigns (
                organization_user_id,
                title,
                description,
                category,
                required_volunteers,
                max_volunteers,
                location,
                city,
                state,
                latitude,
                longitude,
                start_date,
                end_date
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7,
                $8, $9, $10, $11, $12, $13
            )
            RETURNING *`,
            [
                req.user.userId,
                title.trim(),
                description.trim(),
                category,
                requiredVolunteers,
                maxVolunteers,
                location.trim(),
                city || null,
                state || null,
                latitude ?? null,
                longitude ?? null,
                start,
                end
            ]
        );

        const campaign = campaignResult.rows[0];

        for (const skillId of skills) {
            await client.query(
                `INSERT INTO campaign_skills (campaign_id, skill_id)
                 VALUES ($1, $2)`,
                [campaign.id, skillId]
            );
        }

        await client.query("COMMIT");

        // Invalidate campaign and dashboard caches
        await invalidateCampaignCache(req.user.userId);

        await invalidateDashboardCache({
            organizationIds: [req.user.userId],
            admin: true
        });

        await invalidateAllMatchingCaches();

        res.status(201).json({
            message: "Campaign created successfully",
            campaign
        });

    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23503") {
            return res.status(400).json({
                message: "One or more selected skill IDs do not exist"
            });
        }

        console.error("Create campaign error:", error);

        res.status(500).json({
            message: "Unable to create campaign"
        });

    } finally {
        client.release();
    }
};


// Get campaigns created by the logged-in organization
const getMyCampaigns = async (req, res) => {
    try {
        const organizationId = req.user.userId;
        const cacheKey = `campaigns:organization:${organizationId}`;

        // Check Redis first
        const cachedData = await getCachedCampaigns(cacheKey);

        if (cachedData) {
            return res.json(cachedData);
        }

        // Fetch from PostgreSQL if cache misses
        const result = await pool.query(
            `SELECT
                c.*,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', s.id,
                            'name', s.skill_name
                        )
                    ) FILTER (WHERE s.id IS NOT NULL),
                    '[]'
                ) AS skills
             FROM campaigns c
             LEFT JOIN campaign_skills cs ON cs.campaign_id = c.id
             LEFT JOIN skills s ON s.id = cs.skill_id
             WHERE c.organization_user_id = $1
             GROUP BY c.id
             ORDER BY c.created_at DESC`,
            [organizationId]
        );

        const responseData = {
            count: result.rows.length,
            campaigns: result.rows
        };

        // Save response in Redis
        await setCachedCampaigns(cacheKey, responseData);

        res.json(responseData);

    } catch (error) {
        console.error("Get organization campaigns error:", error);

        res.status(500).json({
            message: "Unable to retrieve campaigns"
        });
    }
};

module.exports = {
    createCampaign,
    getMyCampaigns
};
