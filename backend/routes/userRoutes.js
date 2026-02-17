const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// Update Income
router.put("/income", auth, async (req, res) => {
  try {
    const { income } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { income },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error updating income" });
  }
});

// Get Current User (to fetch income)
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

module.exports = router;
