
const express = require("express");

const {
    applyForCampaign,
    getCampaignApplications,
    reviewApplication,
    getMyApplications
} = require("../controllers/applicationController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    requireApprovedOrganization
} = require("../middleware/organizationMiddleware");

const router = express.Router();

// Volunteer applies to a campaign
router.post(
    "/campaigns/:campaignId/apply",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    applyForCampaign
);

// Volunteer views their applications
router.get(
    "/my-applications",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    getMyApplications
);

// Organization views applicants
router.get(
    "/campaigns/:campaignId/applications",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    getCampaignApplications
);

// Organization reviews an application
router.patch(
    "/:applicationId/review",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    reviewApplication
);

module.exports = router;
