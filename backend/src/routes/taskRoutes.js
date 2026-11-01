const express = require("express");
const router = express.Router();

const {
    createTask,
    getCampaignTasks,
    getMyTasks,
    submitTask,
    reviewTask
} = require("../controllers/taskController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    requireApprovedOrganization
} = require("../middleware/organizationMiddleware");

// Organization creates a task for a group
router.post(
    "/campaigns/:campaignId",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    createTask
);

// Organization views campaign tasks
router.get(
    "/campaigns/:campaignId",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    getCampaignTasks
);

// Group leader views assigned tasks
router.get(
    "/my-tasks",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    getMyTasks
);

// Group leader submits evidence
router.patch(
    "/:taskId/submit",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    submitTask
);

// Organization verifies or rejects evidence
router.patch(
    "/:taskId/review",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    reviewTask
);

module.exports = router;