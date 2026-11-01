const express = require("express");
const router = express.Router();

const {
    createIssue,
    getMyIssues,
    getOrganizationIssues,
    reviewIssue
} = require("../controllers/issueController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    requireApprovedOrganization
} = require("../middleware/organizationMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Volunteer submits a report
router.post(
    "/",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    upload.single("image"),
    createIssue
);

// Volunteer views their reports
router.get(
    "/my-reports",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    getMyIssues
);

// Organization views reports in its city
router.get(
    "/organization",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    getOrganizationIssues
);

// Organization reviews a report
router.patch(
    "/:reportId/review",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    reviewIssue
);

module.exports = router;