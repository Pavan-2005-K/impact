
const pool = require("../config/db");

// Retrieve limited, role-specific information from PostgreSQL.
async function getChatbotContext(userId, role) {
    if (role === "VOLUNTEER") {
        return await getVolunteerContext(userId);
    }

    if (role === "ORGANIZATION") {
        return await getOrganizationContext(userId);
    }

    if (role === "ADMIN") {
        return await getAdminContext();
    }

    throw new Error("Unsupported user role.");
}


// Volunteer: only the logged-in volunteer's information
async function getVolunteerContext(userId) {
    const profileResult = await pool.query(
        `SELECT u.full_name, vp.occupation, vp.city, vp.state
         FROM users u
         JOIN volunteer_profiles vp ON vp.user_id = u.id
         WHERE u.id = $1 AND u.role = 'VOLUNTEER'
         AND u.account_status = 'ACTIVE'`,
        [userId]
    );

    if (profileResult.rows.length === 0) {
        throw new Error("Active volunteer profile not found.");
    }

    const applicationsResult = await pool.query(
        `SELECT c.title, c.category, c.city, c.start_date,
                ca.status, ca.match_score
         FROM campaign_applications ca
         JOIN campaigns c ON c.id = ca.campaign_id
         WHERE ca.volunteer_id = $1
         ORDER BY ca.applied_at DESC
         LIMIT 10`,
        [userId]
    );

    const groupsResult = await pool.query(
        `SELECT cg.group_name, c.title AS campaign_title,
                cg.leader_id
         FROM campaign_group_members cgm
         JOIN campaign_groups cg ON cg.id = cgm.group_id
         JOIN campaigns c ON c.id = cg.campaign_id
         WHERE cgm.volunteer_id = $1
         ORDER BY cg.created_at DESC
         LIMIT 10`,
        [userId]
    );

    const tasksResult = await pool.query(
        `SELECT ct.title, ct.description, ct.status,
                ct.due_date, c.title AS campaign_title,
                cg.group_name
         FROM campaign_tasks ct
         JOIN campaign_groups cg ON cg.id = ct.group_id
         JOIN campaign_group_members cgm ON cgm.group_id = cg.id
         JOIN campaigns c ON c.id = ct.campaign_id
         WHERE cgm.volunteer_id = $1
         ORDER BY ct.created_at DESC
         LIMIT 10`,
        [userId]
    );

    const reportsResult = await pool.query(
        `SELECT title, category, city, status, created_at
         FROM issue_reports
         WHERE reporter_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId]
    );

    return {
        role: "VOLUNTEER",
        profile: profileResult.rows[0],
        applications: applicationsResult.rows,
        groups: groupsResult.rows,
        tasks: tasksResult.rows,
        issueReports: reportsResult.rows
    };
}


// Organization: only its own campaigns and related information
async function getOrganizationContext(userId) {
    const organizationResult = await pool.query(
        `SELECT o.organization_name, o.city, o.state,
                o.approval_status
         FROM organizations o
         WHERE o.user_id = $1`,
        [userId]
    );

    if (organizationResult.rows.length === 0) {
        throw new Error("Organization profile not found.");
    }

    const organization = organizationResult.rows[0];

    if (organization.approval_status !== "APPROVED") {
        return {
            role: "ORGANIZATION",
            organization,
            notice: "This organization is not approved. Campaign management is unavailable until approval."
        };
    }

    const campaignsResult = await pool.query(
        `SELECT c.id, c.title, c.category, c.city,
                c.start_date, c.end_date, c.status,
                c.required_volunteers, c.max_volunteers,
                COUNT(DISTINCT ca.id)::int AS total_applications,
                COUNT(DISTINCT CASE
                    WHEN ca.status = 'CONFIRMED' THEN ca.id
                END)::int AS confirmed_volunteers
         FROM campaigns c
         LEFT JOIN campaign_applications ca
             ON ca.campaign_id = c.id
         WHERE c.organization_user_id = $1
         GROUP BY c.id
         ORDER BY c.created_at DESC
         LIMIT 10`,
        [userId]
    );

    const tasksResult = await pool.query(
        `SELECT ct.title, ct.status, ct.due_date,
                c.title AS campaign_title,
                cg.group_name
         FROM campaign_tasks ct
         JOIN campaigns c ON c.id = ct.campaign_id
         JOIN campaign_groups cg ON cg.id = ct.group_id
         WHERE c.organization_user_id = $1
         ORDER BY ct.created_at DESC
         LIMIT 15`,
        [userId]
    );

    const reportsResult = await pool.query(
        `SELECT ir.title, ir.category, ir.city,
                ir.status, ir.created_at
         FROM issue_reports ir
         WHERE LOWER(ir.city) = LOWER($1)
         ORDER BY ir.created_at DESC
         LIMIT 10`,
        [organization.city]
    );

    return {
        role: "ORGANIZATION",
        organization,
        campaigns: campaignsResult.rows,
        tasks: tasksResult.rows,
        communityIssueReports: reportsResult.rows
    };
}


// Admin: platform-level summary information
async function getAdminContext() {
    const result = await pool.query(
        `SELECT
            (SELECT COUNT(*) FROM users
             WHERE role = 'VOLUNTEER')::int AS total_volunteers,

            (SELECT COUNT(*) FROM organizations)::int
                AS total_organizations,

            (SELECT COUNT(*) FROM organizations
             WHERE approval_status = 'PENDING')::int
                AS pending_organizations,

            (SELECT COUNT(*) FROM organizations
             WHERE approval_status = 'APPROVED')::int
                AS approved_organizations,

            (SELECT COUNT(*) FROM campaigns)::int
                AS total_campaigns,

            (SELECT COUNT(*) FROM campaigns
             WHERE status = 'PUBLISHED')::int
                AS published_campaigns,

            (SELECT COUNT(*) FROM campaign_applications)::int
                AS total_applications,

            (SELECT COUNT(*) FROM issue_reports)::int
                AS total_issue_reports,

            (SELECT COUNT(*) FROM issue_reports
             WHERE status = 'RESOLVED')::int
                AS resolved_issue_reports`
    );

    return {
        role: "ADMIN",
        platformStatistics: result.rows[0]
    };
}

module.exports = { getChatbotContext };
