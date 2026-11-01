
const express = require("express");

const {
    getPendingOrganizations,
    reviewOrganization
} = require("../controllers/adminController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// All routes in this file require an authenticated ADMIN
router.use(authenticateToken);
router.use(authorizeRoles("ADMIN"));

// List pending organizations
router.get("/organizations/pending", getPendingOrganizations);

// Approve or reject an organization
router.patch("/organizations/:organizationId/review", reviewOrganization);

module.exports = router;
