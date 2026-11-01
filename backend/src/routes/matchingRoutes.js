
const express = require("express");

const {
    getVolunteerRecommendations,
    getAIMatchingRecommendations,
    getOrganizationVolunteerMatches
} = require("../controllers/matchingController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    requireApprovedOrganization
} = require("../middleware/organizationMiddleware");

const router = express.Router();

// Existing volunteer recommendations
router.get(
    "/recommended-campaigns",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    getVolunteerRecommendations
);

// New AI-powered volunteer matching assistant
router.get(
    "/ai-recommendations",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    getAIMatchingRecommendations
);

// Existing organization volunteer matching
router.get(
    "/campaigns/:campaignId/matching-volunteers",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    getOrganizationVolunteerMatches
);

module.exports = router;
