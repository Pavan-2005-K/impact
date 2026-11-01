
require("dotenv").config();

const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const resetPassword = async () => {
    try {
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password || password.length < 12) {
            throw new Error("Check ADMIN_EMAIL and ADMIN_PASSWORD in .env. Password must be at least 12 characters.");
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await pool.query(
            `UPDATE users
             SET password_hash = $1
             WHERE email = $2 AND role = 'ADMIN'
             RETURNING id, email, role`,
            [passwordHash, email]
        );

        if (result.rows.length === 0) {
            throw new Error("Admin account not found");
        }

        console.log("Admin password reset successfully");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Password reset failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

resetPassword();
