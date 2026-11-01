
const pool = require("../config/db");
const {
    getRecommendedCampaigns
} = require("../services/matchingService");

// Volunteer applies for a campaign
const applyForCampaign = async (req, res) => {
    const campaignId = Number(req.params.campaignId);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
        return res.status(400).json({
            message: "Invalid campaign ID"
        });
    }

    try {
        // Generate the volunteer's matching score
        const recommendations = await getRecommendedCampaigns(
            req.user.userId
        );

        if (recommendations === null) {
            return res.status(404).json({
                message: "Volunteer profile not found or account inactive"
            });
        }

        const match = recommendations.find(
            item => item.campaign.id === campaignId
        );

        if (!match) {
            return res.status(404).json({
                message: "Campaign not found, not published, or no longer available"
            });
        }

        const result = await pool.query(
            `INSERT INTO campaign_applications
                (campaign_id, volunteer_id, match_score, score_breakdown)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (campaign_id, volunteer_id) DO NOTHING
             RETURNING *`,
            [
                campaignId,
                req.user.userId,
                match.matchScore,
                JSON.stringify(match.breakdown)
            ]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({
                message: "You have already applied for this campaign"
            });
        }

        res.status(201).json({
            message: "Campaign application submitted successfully",
            application: result.rows[0]
        });

    } catch (error) {
        console.error("Apply for campaign error:", error);

        res.status(500).json({
            message: "Unable to submit campaign application"
        });
    }
};


// Organization views applicants ranked by matching score
const getCampaignApplications = async (req, res) => {
    const campaignId = Number(req.params.campaignId);

    if (!Number.isInteger(campaignId) || campaignId <= 0) {
        return res.status(400).json({
            message: "Invalid campaign ID"
        });
    }

    try {
        const result = await pool.query(
            `SELECT
                a.id AS application_id,
                a.campaign_id,
                a.volunteer_id,
                a.match_score,
                a.score_breakdown,
                a.status,
                a.applied_at,
                u.full_name,
                u.email,
                u.phone,
                vp.occupation,
                vp.city,
                vp.state
             FROM campaign_applications a
             JOIN campaigns c ON c.id = a.campaign_id
             JOIN users u ON u.id = a.volunteer_id
             JOIN volunteer_profiles vp ON vp.user_id = u.id
             WHERE a.campaign_id = $1
               AND c.organization_user_id = $2
             ORDER BY a.match_score DESC, a.applied_at ASC`,
            [campaignId, req.user.userId]
        );

        res.json({
            count: result.rows.length,
            applications: result.rows
        });

    } catch (error) {
        console.error("Get campaign applications error:", error);

        res.status(500).json({
            message: "Unable to retrieve applications"
        });
    }
};


// Organization confirms, waitlists or rejects an applicant
const reviewApplication = async (req, res) => {
    const applicationId = Number(req.params.applicationId);
    const { status } = req.body;

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
        return res.status(400).json({
            message: "Invalid application ID"
        });
    }

    if (!["CONFIRMED", "WAITLISTED", "REJECTED"].includes(status)) {
        return res.status(400).json({
            message: "Status must be CONFIRMED, WAITLISTED or REJECTED"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lock campaign row to prevent concurrent overbooking
        const applicationResult = await client.query(
            `SELECT a.id, a.campaign_id, a.status,
                    c.max_volunteers, c.organization_user_id
             FROM campaign_applications a
             JOIN campaigns c ON c.id = a.campaign_id
             WHERE a.id = $1
             FOR UPDATE OF c`,
            [applicationId]
        );

        if (
            applicationResult.rows.length === 0 ||
            Number(applicationResult.rows[0].organization_user_id) !==
                req.user.userId
        ) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Application not found"
            });
        }

        const application = applicationResult.rows[0];

        if (!["PENDING", "WAITLISTED"].includes(application.status)) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "This application has already been reviewed"
            });
        }

        let finalStatus = status;

        if (status === "CONFIRMED") {
            const countResult = await client.query(
                `SELECT COUNT(*) AS confirmed_count
                 FROM campaign_applications
                 WHERE campaign_id = $1
                   AND status = 'CONFIRMED'`,
                [application.campaign_id]
            );

            const confirmedCount = Number(
                countResult.rows[0].confirmed_count
            );

            if (confirmedCount >= application.max_volunteers) {
                finalStatus = "WAITLISTED";
            }
        }

        const updateResult = await client.query(
            `UPDATE campaign_applications
             SET status = $1,
                 reviewed_at = CURRENT_TIMESTAMP,
                 reviewed_by = $2
             WHERE id = $3
             RETURNING *`,
            [finalStatus, req.user.userId, applicationId]
        );

        await client.query("COMMIT");

        res.json({
            message: finalStatus === "CONFIRMED"
                ? "Volunteer confirmed successfully"
                : finalStatus === "WAITLISTED"
                    ? "Volunteer added to the waitlist"
                    : "Application rejected successfully",
            application: updateResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Review application error:", error);

        res.status(500).json({
            message: "Unable to review application"
        });

    } finally {
        client.release();
    }
};


// Volunteer views their own applications
const getMyApplications = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                a.id AS application_id,
                a.match_score,
                a.score_breakdown,
                a.status,
                a.applied_at,
                c.id AS campaign_id,
                c.title,
                c.location,
                c.city,
                c.start_date,
                c.end_date,
                o.organization_name
             FROM campaign_applications a
             JOIN campaigns c ON c.id = a.campaign_id
             JOIN organizations o ON o.user_id = c.organization_user_id
             WHERE a.volunteer_id = $1
             ORDER BY a.applied_at DESC`,
            [req.user.userId]
        );

        res.json({
            count: result.rows.length,
            applications: result.rows
        });

    } catch (error) {
        console.error("Get my applications error:", error);

        res.status(500).json({
            message: "Unable to retrieve your applications"
        });
    }
};

module.exports = {
    applyForCampaign,
    getCampaignApplications,
    reviewApplication,
    getMyApplications
};
