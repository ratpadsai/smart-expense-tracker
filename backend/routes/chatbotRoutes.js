const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const ChatHistory = require("../models/ChatHistory");

// ❌ Removed auth middleware for now
// router.post("/", auth, async (req, res) => {

router.post("/", async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.json({
        reply: "Please ask something about your finances.",
      });
    }

    // If no userId provided, prevent crash
    if (!userId) {
      return res.json({
        reply: "User not identified. Please login again.",
      });
    }

    const transactions = await Transaction.find({ userId });

    if (transactions.length === 0) {
      return res.json({
        reply: "You have no transactions yet. Add some expenses first.",
      });
    }

    const msg = message.toLowerCase();

    // 🔹 Total Spending
    const total = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    // 🔹 Highest Expense
    const highest = transactions.reduce((max, t) =>
      Number(t.amount) > Number(max.amount) ? t : max
    );

    // 🔹 Category Breakdown
    const categoryTotals = {};
    transactions.forEach((t) => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += Number(t.amount);
    });

    const categories = Object.keys(categoryTotals);

    // 🔹 Average Expense
    const average = total / transactions.length;

    // 🔹 Simple Monthly Prediction
    const predictedNextMonth = total;

    // 🔹 Overspending Detection
    const topCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0];

    let reply = "";

    if (msg.includes("total")) {
      reply = `Your total spending is ₹${total}.`;
    }

    else if (msg.includes("highest") || msg.includes("largest")) {
      reply = `Your highest expense was ₹${highest.amount} on "${highest.title}".`;
    }

    else if (msg.includes("average")) {
      reply = `Your average transaction amount is ₹${average.toFixed(2)}.`;
    }

    else if (msg.includes("category")) {
      reply = `You are spending across these categories: ${categories.join(", ")}.`;
    }

    else if (msg.includes("predict") || msg.includes("next month")) {
      reply = `Based on current spending, you may spend around ₹${predictedNextMonth} next month.`;
    }

    else if (msg.includes("advice") || msg.includes("save")) {
      reply = `You are spending most on "${topCategory[0]}" (₹${topCategory[1]}). Try reducing this category to improve savings.`;
    }

    else if (msg.includes("overspend") || msg.includes("alert")) {
      if (total > 20000) {
        reply = "⚠️ You are spending above a healthy monthly range. Consider setting a budget.";
      } else {
        reply = "✅ Your spending looks controlled. Keep it up!";
      }
    }

    else {
      reply = "You can ask about total spending, highest expense, average, category breakdown, savings advice, or next month prediction.";
    }

    // Save Chat History
    await ChatHistory.create({
      userId,
      message,
      reply,
    });

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "Something went wrong.",
    });
  }
});

module.exports = router;
