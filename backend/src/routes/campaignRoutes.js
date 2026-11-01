
const express = require("express");

const {
    createCampaign,
    getMyCampaigns
} = require("../controllers/campaignController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    requireApprovedOrganization
} = require("../middleware/organizationMiddleware");

const router = express.Router();

// Every campaign route requires an approved organization
router.use(authenticateToken);
router.use(authorizeRoles("ORGANIZATION"));
router.use(requireApprovedOrganization);

// Create campaign
router.post("/", createCampaign);

// Get campaigns belonging to logged-in organization
router.get("/my-campaigns", getMyCampaigns);

module.exports = router;
