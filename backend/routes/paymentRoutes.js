const express = require("express");
const { createOrder } = require("../services/paymentService");
const { getUserById, updateUser } = require("../data/store");

const router = express.Router();

router.get("/config", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  return res.json({ keyId });
});

router.post("/create-order", async (req, res) => {
  const { userId } = req.body;
  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const order = await createOrder({
      amount: 9900,
      currency: "INR",
      receipt: `pro_${userId}_${Date.now()}`
    });

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to create Razorpay order. Check API keys.",
      error: error.message
    });
  }
});

router.post("/confirm-pro", (req, res) => {
  const { userId } = req.body;
  const user = getUserById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updated = updateUser(userId, { isPro: true });
  return res.json({ message: "Pro activated", user: updated });
});

module.exports = router;
