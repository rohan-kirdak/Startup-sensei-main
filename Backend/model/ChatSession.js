import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Startup context this chat is about
    startupName: { type: String },
    ideaDescription: { type: String },
    stage: {
      type: String,
      enum: ["idea", "mvp", "growth", "scaling"],
      default: "idea",
    },

    // Full conversation history (sent to OpenAI each time for memory)
    messages: [messageSchema],

    // AI-generated plan summary (updated after each meaningful exchange)
    generatedPlan: {
      marketingStrategy: { type: String },
      fundingRoadmap: { type: String },
      growthMilestones: { type: String },
      techRecommendations: { type: String },
      nextSteps: [{ type: String }],
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("ChatSession", chatSessionSchema);
