
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

const upload = require("../middleware/uploadMiddleware");
const parseTaskEvidence = upload.fields([
    { name: "afterImage", maxCount: 1 }
]);

const parseTaskEvidenceWithLogging = (req, res, next) => {
    const startedAt = Date.now();

    console.log("Task evidence multipart parsing started:", {
        contentType: req.get("content-type") || "missing",
        contentLength: req.get("content-length") || "unknown"
    });

    req.once("end", () => {
        console.log("Task evidence request body reached end:", {
            elapsedMs: Date.now() - startedAt,
            requestComplete: req.complete
        });
    });

    req.once("aborted", () => {
        console.error("Task evidence request aborted by client:", {
            elapsedMs: Date.now() - startedAt,
            requestComplete: req.complete
        });
    });

    req.once("close", () => {
        if (!req.complete) {
            console.error("Task evidence request connection closed early:", {
                elapsedMs: Date.now() - startedAt,
                requestAborted: req.aborted
            });
        }
    });

    console.log("Task evidence calling upload.fields()");
    parseTaskEvidence(req, res, error => {
        if (error) {
            console.error("Task evidence multipart parsing failed:", {
                name: error.name,
                code: error.code || "unknown",
                message: error.message,
                elapsedMs: Date.now() - startedAt,
                requestComplete: req.complete,
                requestAborted: req.aborted
            });
            return next(error);
        }

        const files = req.files || {};
        const expectedFields = ["afterImage"];
        const fields = Object.fromEntries(
            expectedFields.map(fieldName => {
                const uploadedFiles = files[fieldName] || [];

                return [
                    fieldName,
                    {
                        count: uploadedFiles.length,
                        files: uploadedFiles.map(file => ({
                            originalName: file.originalname,
                            mimeType: file.mimetype
                        }))
                    }
                ];
            })
        );

        console.log("Task evidence upload.fields() succeeded:", {
            elapsedMs: Date.now() - startedAt
        });
        console.log("Task evidence parsed body keys:", Object.keys(req.body || {}));
        console.log("Task evidence parsed file keys:", Object.keys(files));
        console.log("Task evidence parsed expected file fields:", fields);

        console.log("Task evidence multipart parsing completed");

        next();
    });
};

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

// Group leader submits task evidence
router.patch(
    "/:taskId/submit",
    authenticateToken,
    authorizeRoles("VOLUNTEER"),
    parseTaskEvidenceWithLogging,
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
