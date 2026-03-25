const Razorpay = require("razorpay");

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
}

async function createOrder({ amount, currency = "INR", receipt }) {
  const client = getRazorpayClient();
  if (!client) {
    throw new Error("Razorpay keys are missing.");
  }

  return client.orders.create({
    amount,
    currency,
    receipt,
    payment_capture: 1
  });
}

module.exports = {
  createOrder
};
