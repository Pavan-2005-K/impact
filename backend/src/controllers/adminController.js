
const pool = require("../config/db");
const { invalidateDashboardCache } = require("../services/cacheService");

// View organizations waiting for approval
const getPendingOrganizations = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                u.id AS user_id,
                u.full_name AS contact_person,
                u.email,
                u.phone,
                o.organization_name,
                o.registration_number,
                o.organization_type,
                o.description,
                o.address,
                o.city,
                o.state,
                o.created_at,
                o.approval_status
             FROM organizations o
             JOIN users u ON u.id = o.user_id
             WHERE o.approval_status = 'PENDING'
             ORDER BY o.created_at ASC`
        );

        res.json({
            count: result.rows.length,
            organizations: result.rows
        });

    } catch (error) {
        console.error("Get pending organizations error:", error);

        res.status(500).json({
            message: "Unable to retrieve pending organizations"
        });
    }
};


// Approve or reject an organization
const reviewOrganization = async (req, res) => {
    const { organizationId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({
            message: "Status must be APPROVED or REJECTED"
        });
    }

    if (status === "REJECTED" && !rejectionReason?.trim()) {
        return res.status(400).json({
            message: "A rejection reason is required"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE organizations
             SET approval_status = $1,
                 reviewed_by = $2,
                 reviewed_at = CURRENT_TIMESTAMP,
                 rejection_reason = $3
             WHERE user_id = $4
               AND approval_status = 'PENDING'
             RETURNING user_id, organization_name,
                       approval_status, reviewed_at, rejection_reason`,
            [
                status,
                req.user.userId,
                status === "REJECTED" ? rejectionReason.trim() : null,
                organizationId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Pending organization not found, or it has already been reviewed"
            });
        }

        // Invalidate admin and reviewed organization's dashboard caches
        await invalidateDashboardCache({
            organizationIds: [Number(organizationId)],
            admin: true
        });

        res.json({
            message: `Organization ${status.toLowerCase()} successfully`,
            organization: result.rows[0]
        });

    } catch (error) {
        console.error("Review organization error:", error);

        res.status(500).json({
            message: "Unable to review organization"
        });
    }
};

module.exports = {
    getPendingOrganizations,
    reviewOrganization
};
