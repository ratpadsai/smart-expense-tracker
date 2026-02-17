const router = require("express").Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// Add Transaction
router.post("/add", auth, async (req, res) => {
  try {
    const { title, amount, category, type } = req.body;

    const user = await User.findById(req.user.id);
    const transactions = await Transaction.find({ userId: req.user.id });

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = user.budget - totalSpent;

    if (amount > remaining) {
      return res.json({
        warning: `⚠️ You already spent ₹${totalSpent}. Remaining balance ₹${remaining}`
      });
    }

    await Transaction.create({
      userId: req.user.id,
      title,
      amount,
      category,
      type
    });

    res.json({ msg: "Transaction Added Successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// ✅ GET All Transactions (THIS FIXES YOUR ERROR)
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Delete Transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Summary
router.get("/summary", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    const user = await User.findById(req.user.id);

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = user.budget - totalSpent;

    res.json({ totalSpent, remaining });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
