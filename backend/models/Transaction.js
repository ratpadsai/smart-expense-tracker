const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: String,
  title: String,
  amount: Number,
  category: String,
  type: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TransactionSchema);
