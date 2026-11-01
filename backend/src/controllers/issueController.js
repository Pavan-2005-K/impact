
const pool = require("../config/db");
const {
    invalidateDashboardCache
} = require("../services/cacheService");
const {
    uploadImageToCloudinary
} = require("../services/imageUploadService");

// Invalidate dashboards affected by an issue report
const invalidateIssueDashboards = async (report) => {
    const organizations = await pool.query(
        `SELECT user_id
         FROM organizations
         WHERE LOWER(city) = LOWER($1)`,
        [report.city]
    );

    const organizationIds = organizations.rows.map(
        organization => Number(organization.user_id)
    );

    await invalidateDashboardCache({
        volunteerIds: [Number(report.reporter_id)],
        organizationIds,
        admin: true
    });
};


// Volunteer submits a community issue
exports.createIssue = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            location,
            city,
            state,
            latitude,
            longitude
        } = req.body;

        if (!title || !description || !category || !location || !city) {
            return res.status(400).json({
                message: "Title, description, category, location and city are required"
            });
        }

        const uploadedImage = req.file
            ? await uploadImageToCloudinary(req.file, "issue-reports")
            : null;

        const imageUrl = uploadedImage
            ? uploadedImage.imageUrl
            : null;

        const result = await pool.query(
            `INSERT INTO issue_reports (
                reporter_id, title, description, category,
                location, city, state, latitude, longitude, image_url
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
            [
                req.user.userId,
                title.trim(),
                description.trim(),
                category,
                location.trim(),
                city.trim(),
                state || null,
                latitude ?? null,
                longitude ?? null,
                imageUrl || null
            ]
        );

        const report = result.rows[0];

        await invalidateIssueDashboards(report);

        res.status(201).json({
            message: "Community issue reported successfully",
            report
        });
    } catch (error) {
        console.error("Create issue error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Volunteer views their own reports
exports.getMyIssues = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM issue_reports
             WHERE reporter_id = $1
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.json({
            count: result.rows.length,
            reports: result.rows
        });
    } catch (error) {
        console.error("Get my issues error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Organization views reports from its city
exports.getOrganizationIssues = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                r.*,
                u.full_name AS reporter_name,
                u.email AS reporter_email
             FROM issue_reports r
             JOIN users u ON u.id = r.reporter_id
             JOIN organizations o ON o.user_id = $1
             WHERE LOWER(r.city) = LOWER(o.city)
             ORDER BY r.created_at DESC`,
            [req.user.userId]
        );

        res.json({
            count: result.rows.length,
            reports: result.rows
        });
    } catch (error) {
        console.error("Get organization issues error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Organization reviews a report
exports.reviewIssue = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, feedback, campaignId } = req.body;

        const allowedStatuses = [
            "UNDER_REVIEW",
            "ACCEPTED",
            "REJECTED",
            "RESOLVED"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid report status"
            });
        }

        // If a campaign ID is supplied, ensure this organization owns it.
        if (campaignId) {
            const campaign = await pool.query(
                `SELECT id FROM campaigns
                 WHERE id = $1 AND organization_user_id = $2`,
                [campaignId, req.user.userId]
            );

            if (campaign.rows.length === 0) {
                return res.status(400).json({
                    message: "Campaign not found or not owned by your organization"
                });
            }
        }

        const result = await pool.query(
            `UPDATE issue_reports r
             SET
                status = $1,
                reviewed_by = $2,
                reviewed_at = CURRENT_TIMESTAMP,
                review_feedback = $3,
                linked_campaign_id = COALESCE($4, r.linked_campaign_id)
             FROM organizations o
             WHERE r.id = $5
             AND o.user_id = $2
             AND LOWER(r.city) = LOWER(o.city)
             RETURNING r.*`,
            [
                status,
                req.user.userId,
                feedback || null,
                campaignId || null,
                reportId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Report not found in your organization's city"
            });
        }

        const report = result.rows[0];

        await invalidateIssueDashboards(report);

        res.json({
            message: "Issue report updated successfully",
            report
        });
    } catch (error) {
        console.error("Review issue error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
