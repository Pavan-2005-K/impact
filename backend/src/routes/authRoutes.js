
const express = require("express");

const {
    registerVolunteer,
    registerOrganization,
    login
} = require("../controllers/authController");

const router = express.Router();

router.post("/register/volunteer", registerVolunteer);
router.post("/register/organization", registerOrganization);
router.post("/login", login);

module.exports = router;
