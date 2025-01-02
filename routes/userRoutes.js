const express = require("express");
const { signUp, logIn } = require("../controllers/userControllers");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const router = express.Router();

// Google Authentication Routes
router.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication failed" });
        }
        const token = generateJWT(req.user);

        // res.redirect(`/success?token=${token}`); //frontend
        res.status(200).json({ message: "Login successful", token });
    });

// Function to generate JWT token
const generateJWT = (user) => {
    const token = jwt.sign(
        { id: user.userID, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" } 
    );
    return token;
};


// Normal Authentication Routes
router.post("/signup", signUp);
router.post("/login", logIn);

module.exports = router;
