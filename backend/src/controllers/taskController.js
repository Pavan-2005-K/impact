
const pool = require("../config/db");
const {
    invalidateDashboardCache
} = require("../services/cacheService");
const {
    uploadImageToCloudinary
} = require("../services/imageUploadService");

// Helper: invalidate organization and group members' dashboards
const invalidateTaskDashboards = async (campaignId, groupId, organizationId) => {
    try {
        const members = await pool.query(
            `SELECT volunteer_id
             FROM campaign_group_members
             WHERE group_id = $1`,
            [groupId]
        );

        const volunteerIds = members.rows.map(
            member => Number(member.volunteer_id)
        );

        await invalidateDashboardCache({
            volunteerIds,
            organizationIds: [Number(organizationId)]
        });
    } catch (error) {
        console.error("Task dashboard cache invalidation error:", error);
    }
};


// 1. Organization creates and assigns a task to a group
exports.createTask = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { groupId, title, description, dueDate } = req.body;

        if (!groupId || !title || !title.trim()) {
            return res.status(400).json({
                message: "Group ID and task title are required"
            });
        }

        const group = await pool.query(
            `SELECT g.id, g.campaign_id
             FROM campaign_groups g
             JOIN campaigns c ON c.id = g.campaign_id
             WHERE g.id = $1
             AND g.campaign_id = $2
             AND c.organization_user_id = $3`,
            [groupId, campaignId, req.user.userId]
        );

        if (group.rows.length === 0) {
            return res.status(404).json({
                message: "Group not found for this campaign"
            });
        }

        const result = await pool.query(
            `INSERT INTO campaign_tasks
             (campaign_id, group_id, title, description, due_date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                campaignId,
                groupId,
                title.trim(),
                description || null,
                dueDate || null
            ]
        );

        await invalidateTaskDashboards(
            campaignId,
            groupId,
            req.user.userId
        );

        res.status(201).json({
            message: "Task created and assigned successfully",
            task: result.rows[0]
        });
    } catch (error) {
        console.error("Create task error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// 2. Organization views all tasks in a campaign
exports.getCampaignTasks = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const result = await pool.query(
            `SELECT
                t.*,
                g.group_name,
                leader.full_name AS group_leader_name
             FROM campaign_tasks t
             JOIN campaign_groups g ON g.id = t.group_id
             LEFT JOIN users leader ON leader.id = g.leader_id
             JOIN campaigns c ON c.id = t.campaign_id
             WHERE t.campaign_id = $1
             AND c.organization_user_id = $2
             ORDER BY t.created_at DESC`,
            [campaignId, req.user.userId]
        );

        res.json({
            count: result.rows.length,
            tasks: result.rows
        });
    } catch (error) {
        console.error("Get campaign tasks error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// 3. Group leader views tasks assigned to their group
exports.getMyTasks = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                t.*,
                g.group_name,
                c.title AS campaign_title
             FROM campaign_tasks t
             JOIN campaign_groups g ON g.id = t.group_id
             JOIN campaigns c ON c.id = t.campaign_id
             WHERE g.leader_id = $1
             ORDER BY t.created_at DESC`,
            [req.user.userId]
        );

        res.json({
            count: result.rows.length,
            tasks: result.rows
        });
    } catch (error) {
        console.error("Get my tasks error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// 4. Group leader submits task completion and evidence
exports.submitTask = async (req, res) => {
    let stage = "request validation";
    let taskId;

    try {
        ({ taskId } = req.params);
        console.log(`submitTask started (task ${taskId})`);

        const { submissionNotes } = req.body;
        const afterImage = req.files?.afterImage?.[0];

        console.log(`Task evidence submission received (task ${taskId})`);

        if (
            !(
                typeof submissionNotes === "string" &&
                submissionNotes.trim().length > 0
            ) ||
            !afterImage
        ) {
            return res.status(400).json({
                message: "Submission notes and the afterImage file are required."
            });
        }

        stage = "task authorization";
        const taskCheck = await pool.query(
            `SELECT t.status, g.leader_id, c.organization_user_id
             FROM campaign_tasks t
             JOIN campaign_groups g ON g.id = t.group_id
             JOIN campaigns c ON c.id = t.campaign_id
             WHERE t.id = $1`,
            [taskId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const taskToSubmit = taskCheck.rows[0];

        if (Number(taskToSubmit.leader_id) !== Number(req.user.userId)) {
            return res.status(403).json({
                message: "Only the assigned group leader can submit task evidence"
            });
        }

        if (!["PENDING", "IN_PROGRESS", "REJECTED"].includes(taskToSubmit.status)) {
            return res.status(400).json({
                message: "Task cannot be submitted in its current status"
            });
        }

        stage = "Cloudinary upload";
        console.log(`Task evidence afterImage upload starting (task ${taskId})`);
        console.log(
            `Starting afterImage Cloudinary upload (task ${taskId}; ` +
            `${afterImage.originalname}; ${afterImage.mimetype})`
        );
        const afterUpload = await uploadImageToCloudinary(
            afterImage,
            "task-evidence/after"
        );
        console.log(`Task evidence afterImage upload completed (task ${taskId})`);

        const beforeImageUrl = null;
        const afterImageUrl = afterUpload.imageUrl;

        stage = "database update";
        const result = await pool.query(
            `UPDATE campaign_tasks t
             SET
                submission_notes = $1,
                before_image_url = $2,
                after_image_url = $3,
                submitted_by = $4,
                submitted_at = CURRENT_TIMESTAMP,
                status = 'SUBMITTED'
             FROM campaign_groups g
             WHERE t.id = $5
             AND g.id = t.group_id
             AND g.leader_id = $4
             AND t.status IN ('PENDING', 'IN_PROGRESS', 'REJECTED')
             RETURNING t.*`,
            [
                submissionNotes,
                beforeImageUrl,
                afterImageUrl,
                req.user.userId,
                taskId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Task not found, not assigned to your group, or cannot be submitted in its current status"
            });
        }

        const task = result.rows[0];

        await invalidateTaskDashboards(
            task.campaign_id,
            task.group_id,
            taskToSubmit.organization_user_id
        );

        console.log(`Task evidence saved in PostgreSQL (task ${taskId})`);
        res.json({
            message: "Task evidence submitted successfully",
            task
        });
    } catch (error) {
        console.error(
            `Submit task failed during ${stage} (task ${taskId}):`,
            error.message
        );
        res.status(500).json({ message: "Server error" });
    }
};


// 5. Organization verifies or rejects submitted evidence
exports.reviewTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, feedback } = req.body;

        if (!["VERIFIED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                message: "Status must be VERIFIED or REJECTED"
            });
        }

        const result = await pool.query(
            `UPDATE campaign_tasks t
             SET
                status = $1,
                verified_by = $2,
                verified_at = CURRENT_TIMESTAMP,
                verification_feedback = $3
             FROM campaigns c
             WHERE t.id = $4
             AND c.id = t.campaign_id
             AND c.organization_user_id = $2
             AND t.status = 'SUBMITTED'
             RETURNING t.*`,
            [
                status,
                req.user.userId,
                feedback || null,
                taskId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                message: "Task not found, not owned by your organization, or not submitted for review"
            });
        }

        const task = result.rows[0];

        await invalidateTaskDashboards(
            task.campaign_id,
            task.group_id,
            req.user.userId
        );

        res.json({
            message: status === "VERIFIED"
                ? "Task evidence verified successfully"
                : "Task evidence rejected",
            task
        });
    } catch (error) {
        console.error("Review task error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
