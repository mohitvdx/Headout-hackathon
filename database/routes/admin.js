const { Router } = require("express");
const jwt = require("jsonwebtoken");
const adminMiddleware = require("../middleware/admin");
const { Admin, Course } = require("../db");
const router = Router();

// --- Admin Routes ---

## Admin Signup
router.post("/signup", async (req, res) => {
    // FIX: Get username and password from the request BODY, not headers.
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // The password will be automatically hashed by the pre-save hook in your db.js
        await Admin.create({
            username,
            password,
        });

        // FIX: Success response is now inside the try block with a 201 status.
        res.status(201).json({
            message: "Admin created successfully",
        });
    } catch (error) {
        // FIX: Handle specific errors, like a duplicate username.
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username is already taken." });
        }
        res.status(500).json({ message: "An error occurred during signup." });
    }
});

## Admin Sign-in
router.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        const admin = await Admin.findOne({ username });
        // The comparePassword method should be defined in your Admin schema
        if (admin && (await admin.comparePassword(password))) {
            const token = jwt.sign({ username: admin.username }, process.env.JWT_SECRET);
            return res.json({ token });
        }
        res.status(401).json({ message: "Invalid username or password." });
    } catch (error) {
        res.status(500).json({ message: "An internal server error occurred." });
    }
});

## Course Creation
router.post("/courses", adminMiddleware, async (req, res) => {
    // FIX: Added a robust try...catch block.
    try {
        const { title, description, imageLink, price, isPublished } = req.body;

        // The admin's identity (e.g., username) should be available from the middleware
        const createdBy = req.admin.username;

        const newCourse = await Course.create({
            title,
            description,
            imageLink, // FIX: Changed to camelCase
            price,     // FIX: Changed to camelCase
            isPublished,
            createdBy, // Track which admin created the course
        });

        res.status(201).json({
            message: "Course created successfully",
            courseId: newCourse._id,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create course." });
    }
});

## Get All Courses by Admin
router.get("/courses", adminMiddleware, async (req, res) => {
    // FIX: Added a try...catch block.
    try {
        // FIX: Fetch only courses created by the currently signed-in admin.
        const createdBy = req.admin.username;
        const courses = await Course.find({ createdBy });
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch courses." });
    }
});

module.exports = router;