const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function issueToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

// POST /register  { fullName, email, password } -> AuthResponse
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "fullName, email and password are all required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email: email.toLowerCase().trim(), passwordHash });

    const token = issueToken(user._id.toString());
    res.status(201).json({
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

// POST /login  { email, password } -> AuthResponse
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = issueToken(user._id.toString());
    res.status(200).json({
      userId: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
