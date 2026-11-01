const pool = require("../config/db");

// Organization creates a group for its campaign
exports.createGroup = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { groupName } = req.body;

        if (!groupName || !groupName.trim()) {
            return res.status(400).json({
                message: "Group name is required"
            });
        }

        const campaign = await pool.query(
            `SELECT id FROM campaigns
             WHERE id = $1 AND organization_user_id = $2
             AND status = 'PUBLISHED'`,
            [campaignId, req.user.userId]
        );

        if (campaign.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found or not owned by your organization"
            });
        }

        const result = await pool.query(
            `INSERT INTO campaign_groups (campaign_id, group_name)
             VALUES ($1, $2)
             RETURNING *`,
            [campaignId, groupName.trim()]
        );

        res.status(201).json({
            message: "Group created successfully",
            group: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A group with this name already exists in this campaign"
            });
        }

        console.error("Create group error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Organization adds a confirmed volunteer to a group
exports.addGroupMember = async (req, res) => {
    const client = await pool.connect();

    try {
        const { groupId } = req.params;
        const { volunteerId } = req.body;

        if (!volunteerId) {
            return res.status(400).json({
                message: "Volunteer ID is required"
            });
        }

        await client.query("BEGIN");

        const groupResult = await client.query(
            `SELECT g.id, g.campaign_id
             FROM campaign_groups g
             JOIN campaigns c ON c.id = g.campaign_id
             WHERE g.id = $1
             AND c.organization_user_id = $2
             FOR UPDATE OF g`,
            [groupId, req.user.userId]
        );

        if (groupResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message: "Group not found"
            });
        }

        const campaignId = groupResult.rows[0].campaign_id;

        const application = await client.query(
            `SELECT id FROM campaign_applications
             WHERE campaign_id = $1
             AND volunteer_id = $2
             AND status = 'CONFIRMED'`,
            [campaignId, volunteerId]
        );

        if (application.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Only confirmed volunteers can be added"
            });
        }

        const existing = await client.query(
            `SELECT cgm.id
             FROM campaign_group_members cgm
             JOIN campaign_groups cg ON cg.id = cgm.group_id
             WHERE cg.campaign_id = $1
             AND cgm.volunteer_id = $2`,
            [campaignId, volunteerId]
        );

        if (existing.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                message: "Volunteer already belongs to a group in this campaign"
            });
        }

        const result = await client.query(
            `INSERT INTO campaign_group_members (group_id, volunteer_id)
             VALUES ($1, $2)
             RETURNING *`,
            [groupId, volunteerId]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Volunteer added to group successfully",
            member: result.rows[0]
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Add group member error:", error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
};


// Organization assigns a group leader
exports.assignGroupLeader = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { volunteerId } = req.body;

        if (!volunteerId) {
            return res.status(400).json({
                message: "Volunteer ID is required"
            });
        }

        const result = await pool.query(
            `UPDATE campaign_groups g
             SET leader_id = $1
             FROM campaigns c
             WHERE g.id = $2
             AND c.id = g.campaign_id
             AND c.organization_user_id = $3
             AND EXISTS (
                 SELECT 1
                 FROM campaign_group_members m
                 WHERE m.group_id = g.id
                 AND m.volunteer_id = $1
             )
             RETURNING g.*`,
            [volunteerId, groupId, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Group not found, or volunteer is not a member of this group"
            });
        }

        res.json({
            message: "Group leader assigned successfully",
            group: result.rows[0]
        });
    } catch (error) {
        console.error("Assign leader error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Organization views groups and members for a campaign
exports.getCampaignGroups = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const campaign = await pool.query(
            `SELECT id FROM campaigns
             WHERE id = $1 AND organization_user_id = $2`,
            [campaignId, req.user.userId]
        );

        if (campaign.rows.length === 0) {
            return res.status(404).json({
                message: "Campaign not found"
            });
        }

        const result = await pool.query(
            `SELECT
                g.id AS group_id,
                g.group_name,
                g.leader_id,
                leader.full_name AS leader_name,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'volunteer_id', u.id,
                            'full_name', u.full_name,
                            'email', u.email
                        )
                    ) FILTER (WHERE u.id IS NOT NULL),
                    '[]'
                ) AS members
             FROM campaign_groups g
             LEFT JOIN users leader ON leader.id = g.leader_id
             LEFT JOIN campaign_group_members m ON m.group_id = g.id
             LEFT JOIN users u ON u.id = m.volunteer_id
             WHERE g.campaign_id = $1
             GROUP BY g.id, leader.full_name
             ORDER BY g.id`,
            [campaignId]
        );

        res.json({
            count: result.rows.length,
            groups: result.rows
        });
    } catch (error) {
        console.error("Get groups error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Volunteer views their own group
exports.getMyGroup = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                g.id AS group_id,
                g.group_name,
                g.campaign_id,
                c.title AS campaign_title,
                g.leader_id,
                leader.full_name AS leader_name,
                EXISTS (
                    SELECT 1
                    FROM campaign_groups gx
                    WHERE gx.id = g.id
                    AND gx.leader_id = $1
                ) AS is_group_leader
             FROM campaign_group_members m
             JOIN campaign_groups g ON g.id = m.group_id
             JOIN campaigns c ON c.id = g.campaign_id
             LEFT JOIN users leader ON leader.id = g.leader_id
             WHERE m.volunteer_id = $1
             ORDER BY g.created_at DESC`,
            [req.user.userId]
        );

        res.json({
            count: result.rows.length,
            groups: result.rows
        });
    } catch (error) {
        console.error("Get my group error:", error);
        res.status(500).json({ message: "Server error" });
    }
};