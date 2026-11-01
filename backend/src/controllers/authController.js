
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Volunteer registration
const registerVolunteer = async (req, res) => {
    const {
        fullName,
        email,
        password,
        phone,
        occupation,
        bio,
        city,
        state,
        country,
        latitude,
        longitude,
        skills = [],
        availability = []
    } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({
            message: "Full name, email and password are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters"
        });
    }

    if (!Array.isArray(skills) || !Array.isArray(availability)) {
        return res.status(400).json({
            message: "Skills and availability must be arrays"
        });
    }

    const validOccupations = ["STUDENT", "EMPLOYEE", "OTHER"];
    const selectedOccupation = occupation || "OTHER";

    if (!validOccupations.includes(selectedOccupation)) {
        return res.status(400).json({
            message: "Invalid occupation"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const normalizedEmail = email.trim().toLowerCase();

        const passwordHash = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            `INSERT INTO users
             (full_name, email, password_hash, phone, role)
             VALUES ($1, $2, $3, $4, 'VOLUNTEER')
             RETURNING id, full_name, email, role`,
            [fullName.trim(), normalizedEmail, passwordHash, phone || null]
        );

        const user = userResult.rows[0];

        await client.query(
            `INSERT INTO volunteer_profiles
             (user_id, occupation, bio, city, state, country, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                user.id,
                selectedOccupation,
                bio || null,
                city || null,
                state || null,
                country || "India",
                latitude ?? null,
                longitude ?? null
            ]
        );

        for (const skillId of skills) {
            await client.query(
                `INSERT INTO volunteer_skills (volunteer_id, skill_id)
                 VALUES ($1, $2)`,
                [user.id, skillId]
            );
        }

        const validDays = [
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
            "FRIDAY", "SATURDAY", "SUNDAY"
        ];

        for (const slot of availability) {
            if (
                !validDays.includes(slot.dayOfWeek) ||
                !slot.startTime ||
                !slot.endTime
            ) {
                throw new Error("Invalid availability entry");
            }

            await client.query(
                `INSERT INTO volunteer_availability
                 (volunteer_id, day_of_week, start_time, end_time)
                 VALUES ($1, $2, $3, $4)`,
                [user.id, slot.dayOfWeek, slot.startTime, slot.endTime]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            message: "Volunteer registered successfully",
            user
        });

    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            return res.status(409).json({
                message: "This email or skill entry already exists"
            });
        }

        if (error.code === "23503") {
            return res.status(400).json({
                message: "One or more selected skill IDs do not exist"
            });
        }

        if (error.message === "Invalid availability entry") {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Volunteer registration error:", error);

        res.status(500).json({
            message: "Unable to register volunteer"
        });

    } finally {
        client.release();
    }
};


// Organization registration
const registerOrganization = async (req, res) => {
    const {
        contactPersonName,
        organizationName,
        email,
        password,
        phone,
        registrationNumber,
        organizationType,
        description,
        address,
        city,
        state,
        country
    } = req.body;

    if (
        !contactPersonName ||
        !organizationName ||
        !email ||
        !password
    ) {
        return res.status(400).json({
            message: "Contact person name, organization name, email and password are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters"
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const passwordHash = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            `INSERT INTO users
             (full_name, email, password_hash, phone, role)
             VALUES ($1, $2, $3, $4, 'ORGANIZATION')
             RETURNING id, full_name, email, role`,
            [
                contactPersonName.trim(),
                email.trim().toLowerCase(),
                passwordHash,
                phone || null
            ]
        );

        const user = userResult.rows[0];

        await client.query(
            `INSERT INTO organizations
             (user_id, organization_name, registration_number,
              organization_type, description, address, city, state, country)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                user.id,
                organizationName.trim(),
                registrationNumber || null,
                organizationType || null,
                description || null,
                address || null,
                city || null,
                state || null,
                country || "India"
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: "Organization registered successfully. Await admin approval.",
            user,
            approvalStatus: "PENDING"
        });

    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        console.error("Organization registration error:", error);

        res.status(500).json({
            message: "Unable to register organization"
        });

    } finally {
        client.release();
    }
};


// Shared login for all roles
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, full_name, email, password_hash, role, account_status
             FROM users
             WHERE email = $1`,
            [email.trim().toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (user.account_status !== "ACTIVE") {
            return res.status(403).json({
                message: "Your account is suspended"
            });
        }

        let approvalStatus = null;

        if (user.role === "ORGANIZATION") {
            const orgResult = await pool.query(
                `SELECT approval_status
                 FROM organizations
                 WHERE user_id = $1`,
                [user.id]
            );

            approvalStatus = orgResult.rows[0]?.approval_status || null;
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                approvalStatus
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
};


module.exports = {
    registerVolunteer,
    registerOrganization,
    login
};
