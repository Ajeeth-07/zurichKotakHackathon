const express = require("express");
const {
  login,
  logout,
  getUserByToken,
  getManagers,
} = require("../services/authService");

const router = express.Router();

// Login
router.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required." });
  }

  const result = login(username, password);
  if (!result) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  return res.json(result);
});

// Logout
router.post("/logout", express.json(), (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  logout(token);
  return res.json({ message: "Logged out." });
});

// Get current user
router.get("/me", (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  return res.json(user);
});

// Get all managers (for agent to choose approver)
router.get("/managers", (_req, res) => {
  return res.json(getManagers());
});

module.exports = router;
