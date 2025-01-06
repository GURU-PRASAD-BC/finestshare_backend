const express = require("express");
const { signUp, logIn, sendPasswordResetEmail, resetPassword } = require("../controllers/userControllers");
const passport = require("passport");

const router = express.Router();

// Google Authentication Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const token = req.user.generateJWT();
    res.status(200).json({ message: "Login successful", token });
  }
);

// Normal Authentication Routes
router.post("/signup", signUp);
router.post("/login", logIn);

// Password Reset Routes
router.post("/forgot-password", sendPasswordResetEmail);
router.post("/reset-password", resetPassword);

module.exports = router;
