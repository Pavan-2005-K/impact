
const express = require("express");

const {
    registerVolunteer,
    registerOrganization,
    login
} = require("../controllers/authController");

const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// Apply stricter rate limiting to authentication routes
router.use(authLimiter);

router.post("/register/volunteer", registerVolunteer);
router.post("/register/organization", registerOrganization);
router.post("/login", login);

module.exports = router;
