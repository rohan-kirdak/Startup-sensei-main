import Razorpay from "razorpay";
import crypto from "crypto";
import Session from "../model/Session.js";

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === "your_razorpay_key_id_here" || keySecret === "your_razorpay_key_secret_here") {
    throw new Error("Please configure your actual Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) in the Backend/.env file.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const getRazorpayKey = async (req, res, next) => {
  try {
    const key = process.env.RAZORPAY_KEY_ID;
    if (!key || key === "your_razorpay_key_id_here") {
      return res.status(400).json({ message: "Razorpay Key ID is not configured on the server." });
    }
    res.json({ key });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    const session = await Session.findById(sessionId).populate("mentor");
    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    const mentor = session.mentor;
    if (!mentor) {
      res.status(404);
      throw new Error("Mentor not found for this session");
    }

    // Calculate total amount in paise (1 INR = 100 paise)
    const durationInHours = session.duration / 60;
    const amountInINR = mentor.hourlyRate * durationInHours;
    const amountInPaise = Math.round(amountInINR * 100);

    if (amountInPaise <= 0) {
      res.status(400);
      throw new Error("Invalid payment amount");
    }

    const razorpay = getRazorpayInstance();
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_session_${session._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    if (error.error && error.error.description) {
      res.status(error.statusCode || 400);
      return next(new Error(`Razorpay Error: ${error.error.description}`));
    }
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, sessionId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !sessionId) {
      res.status(400);
      throw new Error("Missing verification details");
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === "your_razorpay_key_secret_here") {
      res.status(500);
      throw new Error("Server is not configured with a Razorpay Key Secret.");
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      res.status(400);
      throw new Error("Payment signature verification failed. Please try again.");
    }

    // Find and update session
    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    session.paymentStatus = "paid";
    session.paymentId = razorpay_payment_id;
    session.status = "confirmed";
    await session.save();

    res.json({ message: "Payment verified successfully", session });
  } catch (error) {
    next(error);
  }
};
