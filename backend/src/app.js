
const express = require("express");
const cors = require("cors");

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const groupRoutes = require("./routes/groupRoutes");
const taskRoutes = require("./routes/taskRoutes");
const issueRoutes = require("./routes/issueRoutes");
const app = express();
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const uploadRoutes = require("./routes/uploadRoutes");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/uploads", uploadRoutes);

// Welcome route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to ImpactLink API",
        status: "success"
    });
});

// Backend health check
app.get("/api/health", (req, res) => {
    res.json({
        message: "ImpactLink Backend is running!",
        status: "healthy"
    });
});

// Database health check
app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS current_time, current_database() AS database"
        );

        res.json({
            message: "PostgreSQL connected successfully!",
            status: "success",
            database: result.rows[0].database,
            time: result.rows[0].current_time
        });

    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            message: "Database connection failed",
            status: "error"
        });
    }
});

module.exports = app;
