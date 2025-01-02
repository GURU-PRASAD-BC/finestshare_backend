const express = require("express");
const { signUp, logIn } = require("../controllers/userControllers");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const router = express.Router();

// Function to generate JWT token
const generateJWT = (user) => {
    const token = jwt.sign(
        { id: user.userID, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" } // Token validity (adjust as necessary)
    );
    return token;
};

// Google Authentication Routes
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        // Ensure the user object is present
        if (!req.user) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        // Generate JWT
        const token = generateJWT(req.user);

        // Redirect with the token (or send it as a JSON response)
        res.redirect(`/success?token=${token}`);
    }
);

// Normal Authentication Routes
router.post("/signup", signUp);
router.post("/login", logIn);

module.exports = router;
