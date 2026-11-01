
const express = require("express");

const { uploadImage } = require("../controllers/uploadController");
const upload = require("../middleware/uploadMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/image",
    authenticateToken,
    upload.single("image"),
    uploadImage
);

module.exports = router;
