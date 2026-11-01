const cloudinary = require("../config/cloudinary");

const UPLOAD_TIMEOUT_MS = 30000;

const uploadImageToCloudinary = (file, folder) => {
    return new Promise((resolve, reject) => {
        const cloudinaryConfig = cloudinary.config();
        const missingConfig = ["cloud_name", "api_key", "api_secret"]
            .filter(key => !cloudinaryConfig[key]);

        if (missingConfig.length > 0) {
            const error = new Error(
                `Cloudinary configuration is missing: ${missingConfig.join(", ")}`
            );
            console.error(error.message);
            reject(error);
            return;
        }

        if (!Buffer.isBuffer(file?.buffer)) {
            const error = new Error("Cloudinary upload requires a buffered file");
            console.error(error.message);
            reject(error);
            return;
        }

        let stream;
        let settled = false;
        let timeout;

        const finish = (error, result) => {
            if (settled) return;

            settled = true;
            clearTimeout(timeout);
            stream?.removeListener("error", handleStreamError);

            if (error) {
                console.error(`Cloudinary upload failed (${folder}):`, error.message);
                reject(error);
                return;
            }

            console.log(`Cloudinary upload completed (${folder})`);
            resolve({
                imageUrl: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
            });
        };

        const handleStreamError = error => finish(error);

        try {
            stream = cloudinary.uploader.upload_stream(
                {
                    folder: `impactlink/${folder}`,
                    resource_type: "image",
                    timeout: UPLOAD_TIMEOUT_MS
                },
                (error, result) => {
                    if (error) {
                        finish(new Error(error.message || "Cloudinary upload failed"));
                        return;
                    }
                    if (!result?.secure_url) {
                        finish(new Error("Cloudinary response did not include a secure image URL"));
                        return;
                    }
                    finish(null, result);
                }
            );

            stream.once("error", handleStreamError);
            timeout = setTimeout(() => {
                finish(new Error(`Cloudinary upload timed out after ${UPLOAD_TIMEOUT_MS}ms`));
                stream.destroy();
            }, UPLOAD_TIMEOUT_MS + 5000);

            console.log(`Cloudinary upload started (${folder}, ${file.buffer.length} bytes)`);
            stream.end(file.buffer);
        } catch (error) {
            finish(error);
        }
    });
};

module.exports = { uploadImageToCloudinary };