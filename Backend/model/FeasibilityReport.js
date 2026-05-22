import mongoose from "mongoose";

const feasibilityReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startupName: { type: String, required: true },
    ideaDescription: { type: String, required: true },
    targetMarket: { type: String },
    
    // Rich startup advisory input fields (optional for backward compatibility)
    founderName: { type: String },
    industry: { type: String },
    startupStage: { type: String },
    problemStatement: { type: String },
    usp: { type: String },
    businessModel: { type: String },
    revenueStrategy: { type: String },
    budget: { type: String },
    location: { type: String },
    teamSize: { type: String },
    competitors: { type: String },
    shortGoals: { type: String },
    longGoals: { type: String },
    marketingPlan: { type: String },
    additionalNotes: { type: String },

    aiReport: {
      marketAnalysis: String,
      competitorOverview: String,
      revenueProjection: String,
      riskAssessment: String,
      overallScore: Number, // 0-100
    },
    status: {
      type: String,
      enum: ["pending", "generated"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("FeasibilityReport", feasibilityReportSchema);
