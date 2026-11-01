
const pool = require("../config/db");

const requireApprovedOrganization = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT approval_status
             FROM organizations
             WHERE user_id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(403).json({
                message: "Organization profile not found"
            });
        }

        if (result.rows[0].approval_status !== "APPROVED") {
            return res.status(403).json({
                message: "Your organization must be approved before managing campaigns",
                approvalStatus: result.rows[0].approval_status
            });
        }

        next();

    } catch (error) {
        console.error("Organization approval check error:", error);

        res.status(500).json({
            message: "Unable to verify organization approval"
        });
    }
};

module.exports = { requireApprovedOrganization };
