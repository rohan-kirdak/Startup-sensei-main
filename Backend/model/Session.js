import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // in minutes
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentId: { type: String },
    meetingLink: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
