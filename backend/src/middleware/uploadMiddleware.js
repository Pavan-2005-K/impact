
const multer = require("multer");

const memoryStorage = multer.memoryStorage();
const storage = {
    _handleFile(req, file, cb) {
        console.log("Multer file storage started:", {
            fieldName: file.fieldname,
            mimeType: file.mimetype
        });

        memoryStorage._handleFile(req, file, (error, info) => {
            if (error) {
                console.error("Multer file storage failed:", {
                    fieldName: file.fieldname,
                    message: error.message
                });
            } else {
                console.log("Multer file storage completed:", {
                    fieldName: file.fieldname,
                    size: info.size
                });
            }

            cb(error, info);
        });
    },
    _removeFile(req, file, cb) {
        memoryStorage._removeFile(req, file, cb);
    }
};

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        console.log("Multer file accepted:", {
            fieldName: file.fieldname,
            mimeType: file.mimetype
        });
        return cb(null, true);
    }

    const error = new Error("Only JPG, PNG and WebP images are allowed.");
    console.error("Multer file rejected:", {
        fieldName: file.fieldname,
        mimeType: file.mimetype,
        message: error.message
    });
    cb(error);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;
