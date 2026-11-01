const express = require("express");
const router = express.Router();

const {
    createGroup,
    addGroupMember,
    assignGroupLeader,
    getCampaignGroups,
    getMyGroup
} = require("../controllers/groupController");

const { authenticateToken, authorizeRoles } =
    require("../middleware/authMiddleware");

const { requireApprovedOrganization } =
    require("../middleware/organizationMiddleware");

router.post(
    "/campaigns/:campaignId",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    createGroup
);

router.post(
    "/:groupId/members",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    addGroupMember
);

router.patch(
    "/:groupId/leader",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    assignGroupLeader
);

router.get(
    "/campaigns/:campaignId",
    authenticateToken,
    authorizeRoles("ORGANIZATION"),
    requireApprovedOrganization,
    getCampaignGroups
);

router.get(
    "/my-group",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    getMyGroup
);

module.exports = router;