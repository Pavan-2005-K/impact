const pool = require("../config/db");

// VOLUNTEER DASHBOARD
exports.getVolunteerDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)
                 FROM campaign_applications
                 WHERE volunteer_id = $1) AS total_applications,

                (SELECT COUNT(*)
                 FROM campaign_applications
                 WHERE volunteer_id = $1
                 AND status = 'CONFIRMED') AS confirmed_campaigns,

                (SELECT COUNT(*)
                 FROM campaign_group_members m
                 JOIN campaign_tasks t ON t.group_id = m.group_id
                 WHERE m.volunteer_id = $1) AS assigned_tasks,

                (SELECT COUNT(*)
                 FROM campaign_group_members m
                 JOIN campaign_tasks t ON t.group_id = m.group_id
                 WHERE m.volunteer_id = $1
                 AND t.status = 'VERIFIED') AS completed_tasks,

                (SELECT COUNT(*)
                 FROM issue_reports
                 WHERE reporter_id = $1) AS reports_submitted,

                (SELECT COUNT(*)
                 FROM issue_reports
                 WHERE reporter_id = $1
                 AND status = 'ACCEPTED') AS reports_accepted`,
            [userId]
        );

        const campaigns = await pool.query(
            `SELECT
                c.id,
                c.title,
                c.location,
                c.start_date,
                c.end_date,
                a.status AS application_status,
                a.match_score
             FROM campaign_applications a
             JOIN campaigns c ON c.id = a.campaign_id
             WHERE a.volunteer_id = $1
             ORDER BY a.applied_at DESC
             LIMIT 5`,
            [userId]
        );

        res.json({
            dashboard: result.rows[0],
            recentCampaigns: campaigns.rows
        });
    } catch (error) {
        console.error("Volunteer dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ORGANIZATION DASHBOARD
exports.getOrganizationDashboard = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)
                 FROM campaigns
                 WHERE organization_user_id = $1) AS total_campaigns,

                (SELECT COUNT(*)
                 FROM campaigns
                 WHERE organization_user_id = $1
                 AND status = 'PUBLISHED') AS active_campaigns,

                (SELECT COUNT(*)
                 FROM campaign_applications a
                 JOIN campaigns c ON c.id = a.campaign_id
                 WHERE c.organization_user_id = $1) AS total_applications,

                (SELECT COUNT(*)
                 FROM campaign_applications a
                 JOIN campaigns c ON c.id = a.campaign_id
                 WHERE c.organization_user_id = $1
                 AND a.status = 'CONFIRMED') AS confirmed_volunteers,

                (SELECT COUNT(*)
                 FROM campaign_tasks t
                 JOIN campaigns c ON c.id = t.campaign_id
                 WHERE c.organization_user_id = $1) AS total_tasks,

                (SELECT COUNT(*)
                 FROM campaign_tasks t
                 JOIN campaigns c ON c.id = t.campaign_id
                 WHERE c.organization_user_id = $1
                 AND t.status = 'VERIFIED') AS completed_tasks,

                (SELECT COUNT(*)
                 FROM issue_reports r
                 JOIN organizations o ON o.user_id = $1
                 WHERE LOWER(r.city) = LOWER(o.city)) AS city_reports,

                (SELECT COUNT(*)
                 FROM issue_reports r
                 JOIN organizations o ON o.user_id = $1
                 WHERE LOWER(r.city) = LOWER(o.city)
                 AND r.status = 'ACCEPTED') AS accepted_reports`,
            [userId]
        );

        const campaigns = await pool.query(
            `SELECT
                c.id,
                c.title,
                c.status,
                c.start_date,
                c.end_date,
                COUNT(DISTINCT a.id) AS total_applications,
                COUNT(DISTINCT a.id) FILTER (
                    WHERE a.status = 'CONFIRMED'
                ) AS confirmed_volunteers
             FROM campaigns c
             LEFT JOIN campaign_applications a
                ON a.campaign_id = c.id
             WHERE c.organization_user_id = $1
             GROUP BY c.id
             ORDER BY c.created_at DESC
             LIMIT 5`,
            [userId]
        );

        res.json({
            dashboard: result.rows[0],
            recentCampaigns: campaigns.rows
        });
    } catch (error) {
        console.error("Organization dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ADMIN DASHBOARD
exports.getAdminDashboard = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM users
                 WHERE role = 'VOLUNTEER') AS total_volunteers,

                (SELECT COUNT(*) FROM users
                 WHERE role = 'ORGANIZATION') AS total_organizations,

                (SELECT COUNT(*) FROM organizations
                 WHERE approval_status = 'PENDING') AS pending_organizations,

                (SELECT COUNT(*) FROM organizations
                 WHERE approval_status = 'APPROVED') AS approved_organizations,

                (SELECT COUNT(*) FROM campaigns) AS total_campaigns,

                (SELECT COUNT(*) FROM campaign_applications)
                    AS total_applications,

                (SELECT COUNT(*) FROM issue_reports)
                    AS total_issue_reports,

                (SELECT COUNT(*) FROM issue_reports
                 WHERE status = 'ACCEPTED') AS accepted_issue_reports`
        );

        const organizations = await pool.query(
            `SELECT
                u.id,
                u.full_name,
                u.email,
                o.organization_name,
                o.city,
                o.approval_status,
                o.created_at
             FROM organizations o
             JOIN users u ON u.id = o.user_id
             ORDER BY o.created_at DESC
             LIMIT 5`
        );

        res.json({
            dashboard: result.rows[0],
            recentOrganizations: organizations.rows
        });
    } catch (error) {
        console.error("Admin dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
};