const express = require("express");
const router = express.Router();

const {
    getVolunteerDashboard,
    getOrganizationDashboard,
    getAdminDashboard
} = require("../controllers/dashboardController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    requireApprovedOrganization
} = require("../middleware/organizationMiddleware");

// Volunteer dashboard
router.get(
    "/volunteer",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    getVolunteerDashboard
);

// Organization dashboard
router.get(
    "/organization",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    getOrganizationDashboard
);

// Admin dashboard
router.get(
    "/admin",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAdminDashboard
);

module.exports = router;