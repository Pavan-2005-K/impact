
const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image to upload."
            });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "impactlink",
                    resource_type: "image"
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            stream.end(req.file.buffer);
        });

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully.",
            data: {
                imageUrl: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
            }
        });

    } catch (error) {
        console.error("Image upload error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to upload image."
        });
    }
};

module.exports = { uploadImage };
