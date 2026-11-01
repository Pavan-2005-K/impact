
const pool = require("../config/db");

const WEIGHTS = {
    skills: 0.40,
    location: 0.30,
    availability: 0.20,
    performance: 0.10
};

// Calculate distance between two geographic coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (value) => value * Math.PI / 180;

    const earthRadius = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
};


// Calculate skill matching percentage
const calculateSkillScore = (volunteerSkills, campaignSkills) => {
    if (campaignSkills.length === 0) {
        return 100;
    }

    const volunteerSkillIds = new Set(
        volunteerSkills.map(skill => Number(skill.id))
    );

    const matchedSkills = campaignSkills.filter(skill =>
        volunteerSkillIds.has(Number(skill.id))
    );

    return (matchedSkills.length / campaignSkills.length) * 100;
};


// Calculate location matching percentage
const calculateLocationScore = (volunteer, campaign) => {
    const vLat = Number(volunteer.latitude);
    const vLon = Number(volunteer.longitude);
    const cLat = Number(campaign.latitude);
    const cLon = Number(campaign.longitude);

    const hasCoordinates =
        volunteer.latitude !== null &&
        volunteer.longitude !== null &&
        campaign.latitude !== null &&
        campaign.longitude !== null &&
        [vLat, vLon, cLat, cLon].every(Number.isFinite) &&
        Math.abs(vLat) <= 90 &&
        Math.abs(cLat) <= 90 &&
        Math.abs(vLon) <= 180 &&
        Math.abs(cLon) <= 180;

    if (hasCoordinates) {
        const distance = calculateDistance(vLat, vLon, cLat, cLon);

        return {
            score: Math.max(0, 100 - distance * 2),
            distanceKm: Number(distance.toFixed(2))
        };
    }

    if (
        volunteer.city &&
        campaign.city &&
        volunteer.city.toLowerCase() === campaign.city.toLowerCase()
    ) {
        return { score: 100, distanceKm: null };
    }

    if (
        volunteer.state &&
        campaign.state &&
        volunteer.state.toLowerCase() === campaign.state.toLowerCase()
    ) {
        return { score: 60, distanceKm: null };
    }

    return { score: 20, distanceKm: null };
};


// Get campaign day and time in India local time
const getCampaignLocalTime = (dateValue) => {
    const date = new Date(dateValue);

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);

    const values = {};

    for (const part of parts) {
        values[part.type] = part.value;
    }

    return {
        day: values.weekday.toUpperCase(),
        minutes: Number(values.hour) * 60 + Number(values.minute)
    };
};

const timeToMinutes = (time) => {
    const [hours, minutes] = String(time).split(":").map(Number);
    return hours * 60 + minutes;
};


// Calculate availability score
const calculateAvailabilityScore = (volunteerAvailability, campaign) => {
    const campaignStart = getCampaignLocalTime(campaign.start_date);
    const campaignEnd = getCampaignLocalTime(campaign.end_date);

    // This MVP availability check supports campaigns on one calendar day.
    if (campaignStart.day !== campaignEnd.day) {
        return 0;
    }

    const matchingSlot = volunteerAvailability.find(slot => {
        return (
            slot.day_of_week === campaignStart.day &&
            timeToMinutes(slot.start_time) <= campaignStart.minutes &&
            timeToMinutes(slot.end_time) >= campaignEnd.minutes
        );
    });

    return matchingSlot ? 100 : 0;
};


// Get volunteer's average performance rating
const getPerformanceScore = async (volunteerId) => {
    const result = await pool.query(
        `SELECT AVG(rating)::NUMERIC(3,2) AS average_rating,
                COUNT(*) AS total_ratings
         FROM volunteer_ratings
         WHERE volunteer_id = $1`,
        [volunteerId]
    );

    const average = result.rows[0].average_rating;
    const count = Number(result.rows[0].total_ratings);

    // Use a neutral score for new volunteers with no ratings.
    if (count === 0 || average === null) {
        return {
            score: 50,
            averageRating: null,
            totalRatings: 0
        };
    }

    return {
        score: (Number(average) / 5) * 100,
        averageRating: Number(average),
        totalRatings: count
    };
};


// Calculate final matching score
const calculateMatch = async (volunteer, campaign) => {
    const skillScore = calculateSkillScore(
        volunteer.skills,
        campaign.skills
    );

    const locationResult = calculateLocationScore(volunteer, campaign);

    const availabilityScore = calculateAvailabilityScore(
        volunteer.availability,
        campaign
    );

    const performance = await getPerformanceScore(volunteer.user_id);

    const finalScore =
        skillScore * WEIGHTS.skills +
        locationResult.score * WEIGHTS.location +
        availabilityScore * WEIGHTS.availability +
        performance.score * WEIGHTS.performance;

    const matchedSkills = campaign.skills.filter(campaignSkill =>
        volunteer.skills.some(
            volunteerSkill => Number(volunteerSkill.id) === Number(campaignSkill.id)
        )
    );

    return {
        matchScore: Number(finalScore.toFixed(2)),
        breakdown: {
            skills: Number(skillScore.toFixed(2)),
            location: Number(locationResult.score.toFixed(2)),
            availability: Number(availabilityScore.toFixed(2)),
            performance: Number(performance.score.toFixed(2))
        },
        matchedSkills: matchedSkills.map(skill => skill.name),
        distanceKm: locationResult.distanceKm,
        averageRating: performance.averageRating,
        totalRatings: performance.totalRatings
    };
};


// Fetch one volunteer's profile, skills and availability
const getVolunteerData = async (userId) => {
    const profileResult = await pool.query(
        `SELECT u.id AS user_id, u.full_name, u.email, u.account_status,
                vp.occupation, vp.city, vp.state, vp.country,
                vp.latitude, vp.longitude
         FROM users u
         JOIN volunteer_profiles vp ON vp.user_id = u.id
         WHERE u.id = $1 AND u.role = 'VOLUNTEER'`,
        [userId]
    );

    if (profileResult.rows.length === 0) {
        return null;
    }

    const volunteer = profileResult.rows[0];

    const skillsResult = await pool.query(
        `SELECT s.id, s.skill_name AS name
         FROM volunteer_skills vs
         JOIN skills s ON s.id = vs.skill_id
         WHERE vs.volunteer_id = $1`,
        [userId]
    );

    const availabilityResult = await pool.query(
        `SELECT day_of_week, start_time::TEXT, end_time::TEXT
         FROM volunteer_availability
         WHERE volunteer_id = $1`,
        [userId]
    );

    volunteer.skills = skillsResult.rows;
    volunteer.availability = availabilityResult.rows;

    return volunteer;
};


// Fetch published future campaigns with their required skills
const getPublishedCampaigns = async () => {
    const result = await pool.query(
        `SELECT
            c.*,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'id', s.id,
                        'name', s.skill_name
                    )
                ) FILTER (WHERE s.id IS NOT NULL),
                '[]'
            ) AS skills
         FROM campaigns c
         LEFT JOIN campaign_skills cs ON cs.campaign_id = c.id
         LEFT JOIN skills s ON s.id = cs.skill_id
         WHERE c.status = 'PUBLISHED'
           AND c.start_date > CURRENT_TIMESTAMP
         GROUP BY c.id
         ORDER BY c.start_date ASC`
    );

    return result.rows;
};


// Recommend campaigns to a volunteer
const getRecommendedCampaigns = async (volunteerId) => {
    const volunteer = await getVolunteerData(volunteerId);

    if (!volunteer || volunteer.account_status !== "ACTIVE") {
        return null;
    }

    const campaigns = await getPublishedCampaigns();

    const recommendations = [];

    for (const campaign of campaigns) {
        const match = await calculateMatch(volunteer, campaign);

        recommendations.push({
            campaign,
            ...match
        });
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return recommendations;
};


// Rank volunteers for one organization's campaign
const getCampaignVolunteerMatches = async (campaignId, organizationId) => {
    const campaignResult = await pool.query(
        `SELECT c.*,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', s.id,
                            'name', s.skill_name
                        )
                    ) FILTER (WHERE s.id IS NOT NULL),
                    '[]'
                ) AS skills
         FROM campaigns c
         LEFT JOIN campaign_skills cs ON cs.campaign_id = c.id
         LEFT JOIN skills s ON s.id = cs.skill_id
         WHERE c.id = $1
           AND c.organization_user_id = $2
           AND c.status = 'PUBLISHED'
           AND c.start_date > CURRENT_TIMESTAMP
         GROUP BY c.id`,
        [campaignId, organizationId]
    );

    if (campaignResult.rows.length === 0) {
        return null;
    }

    const campaign = campaignResult.rows[0];

    const volunteersResult = await pool.query(
        `SELECT u.id AS user_id, u.full_name, u.email,
                vp.occupation, vp.city, vp.state, vp.country,
                vp.latitude, vp.longitude
         FROM users u
         JOIN volunteer_profiles vp ON vp.user_id = u.id
         WHERE u.role = 'VOLUNTEER'
           AND u.account_status = 'ACTIVE'`
    );

    const matches = [];

    for (const profile of volunteersResult.rows) {
        const volunteer = await getVolunteerData(profile.user_id);

        if (!volunteer) continue;

        const match = await calculateMatch(volunteer, campaign);

        matches.push({
            volunteer: {
                id: volunteer.user_id,
                fullName: volunteer.full_name,
                email: volunteer.email,
                occupation: volunteer.occupation,
                city: volunteer.city,
                state: volunteer.state
            },
            ...match
        });
    }

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return {
        campaign,
        totalMatchingVolunteers: matches.length,
        recommendedVolunteers: matches.slice(0, campaign.max_volunteers),
        waitlistedVolunteers: matches.slice(campaign.max_volunteers)
    };
};

module.exports = {
    getRecommendedCampaigns,
    getCampaignVolunteerMatches
};
