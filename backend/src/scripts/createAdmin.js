
require("dotenv").config();

const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error("Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env");
        }

        if (ADMIN_PASSWORD.length < 12) {
            throw new Error("Admin password must contain at least 12 characters");
        }

        const email = ADMIN_EMAIL.trim().toLowerCase();

        const existing = await pool.query(
            "SELECT id, role FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            throw new Error("This email already exists. Admin was not created.");
        }

        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

        const result = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role)
             VALUES ($1, $2, $3, 'ADMIN')
             RETURNING id, full_name, email, role`,
            [ADMIN_NAME.trim(), email, passwordHash]
        );

        console.log("Admin account created successfully:");
        console.log(result.rows[0]);

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

createAdmin();
