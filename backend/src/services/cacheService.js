const { redisClient } = require("../config/redis");

const invalidateDashboardCache = async ({
    volunteerIds = [],
    organizationIds = [],
    admin = false
} = {}) => {
    try {
        if (!redisClient.isReady) return;

        const keys = [];

        volunteerIds.forEach((id) => {
            keys.push(`dashboard:volunteer:${id}`);
        });

        organizationIds.forEach((id) => {
            keys.push(`dashboard:organization:${id}`);
        });

        if (admin) {
            keys.push("dashboard:admin");
        }

        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log("Redis CACHE INVALIDATED:", keys);
        }
    } catch (error) {
        console.error("Redis cache invalidation error:", error.message);
    }
};

// Invalidate one volunteer's matching recommendations
const invalidateVolunteerMatchingCache = async (volunteerId) => {
    try {
        if (!redisClient.isReady) return;

        const key = `matching:volunteer:${volunteerId}`;

        await redisClient.del(key);

        console.log(`Redis MATCHING CACHE INVALIDATED: ${key}`);
    } catch (error) {
        console.error("Matching cache invalidation error:", error.message);
    }
};

// Invalidate all volunteer matching recommendations
// Use when a new campaign is created.
const invalidateAllMatchingCaches = async () => {
    try {
        if (!redisClient.isReady) return;

        const keys = [];

        for await (const key of redisClient.scanIterator({
            MATCH: "matching:volunteer:*",
            COUNT: 100
        })) {
            keys.push(key);
        }

        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log("Redis MATCHING CACHES INVALIDATED:", keys);
        }
    } catch (error) {
        console.error("Matching cache invalidation error:", error.message);
    }
};

module.exports = {
    invalidateDashboardCache,
    invalidateVolunteerMatchingCache,
    invalidateAllMatchingCaches
};