const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db");
const { default: mongoose } = require("mongoose");

// --- User Routes ---

// POST /signup
// Creates a new user account.
router.post("/signup", async (req, res) => {
    // FIX: Get username and password from the request BODY, not headers.
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Create the user. The password will be automatically hashed by the pre-save hook in db.js
        await User.create({
            username,
            password,
        });

        // FIX: Success response is now inside the try block.
        res.status(201).json({
            message: "User created successfully",
        });
    } catch (error) {
        // FIX: Handle specific errors, like a duplicate username.
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username already exists. Please choose another." });
        }
        console.error("Signup Error:", error);
        res.status(500).json({ message: "An error occurred during signup." });
    }
});

// GET /courses
// Fetches all available (published) courses for a user.
router.get("/courses", userMiddleware, async (req, res) => {
    try {
        // FIX: Only find courses that are marked as published.
        const courses = await Course.find({
            isPublished: true
        });

        res.json({ courses });
    } catch (error) {
        console.error("Fetch Courses Error:", error);
        res.status(500).json({ message: "Could not fetch courses." });
    }
});

// POST /courses/:courseId
// Allows a logged-in user to purchase a course.
router.post("/courses/:courseId", userMiddleware, async (req, res) => {
    const { courseId } = req.params;
    // NOTE: We get userId from the userMiddleware after it verifies the user's token.
    const userId = req.userId;

    // FIX: Added extensive validation and error handling.
    try {
        // 1. Validate the courseId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid course ID format." });
        }
        
        // 2. Find both the user and the course concurrently for efficiency
        const [user, course] = await Promise.all([
            User.findById(userId),
            Course.findOne({ _id: courseId, isPublished: true })
        ]);

        // 3. Check if the course exists and is published
        if (!course) {
            return res.status(404).json({ message: "Course not found or is not available for purchase." });
        }

        // 4. Check if the user has already purchased the course
        if (user.purchasedCourses.includes(courseId)) {
            return res.status(409).json({ message: "You have already purchased this course." });
        }

        // 5. Add course to user's purchased list and save
        user.purchasedCourses.push(courseId);
        await user.save();

        res.json({
            message: "Course purchased successfully",
        });
    } catch (error) {
        console.error("Purchase Course Error:", error);
        res.status(500).json({ message: "An error occurred while purchasing the course." });
    }
});


// GET /purchasedCourses
// Fetches all courses purchased by the logged-in user.
router.get("/purchasedCourses", userMiddleware, async (req, res) => {
    // NOTE: We get userId from the userMiddleware.
    const userId = req.userId;

    try {
        // FIX: Use .populate() for an efficient single query to get user's courses.
        const user = await User.findById(userId).populate('purchasedCourses');

        if (!user) {
            // This case is unlikely if middleware is correct, but good for safety.
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ purchasedCourses: user.purchasedCourses || [] });
    } catch (error) {
        console.error("Fetch Purchased Courses Error:", error);
        res.status(500).json({ message: "Could not fetch purchased courses." });
    }
});

module.exports = router;