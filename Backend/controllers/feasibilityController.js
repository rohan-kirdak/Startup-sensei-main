import OpenAI from "openai";
import FeasibilityReport from "../model/FeasibilityReport.js";

const isGeminiKey = process.env.OPENAI_API_KEY?.startsWith("AIzaSy");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: isGeminiKey
    ? "https://generativelanguage.googleapis.com/v1beta/openai"
    : undefined,
});

/**
 * Safely parse JSON from AI response, handling potential markdown wrappers
 */
const parseAIResponse = (content) => {
  try {
    // Remove markdown code blocks if present (e.g., ```json ... ``` or ``` ...)
    const cleanedContent = content.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1").trim();
    // If there's still something outside the JSON, this regex might need adjustment, 
    // but usually Gemini/OpenAI with json_object mode are pretty good.
    return JSON.parse(cleanedContent || content);
  } catch (error) {
    console.error("AI_PARSE_ERROR. Raw Content:", content);
    throw new Error("AI returned an invalid response format. Please try again.");
  }
};

// @route POST /api/feasibility/generate
export const generateReport = async (req, res, next) => {
  console.log("ROUTE_HIT: /api/feasibility/generate");
  let reportId = null;

  try {
    const { 
      startupName, 
      ideaDescription, 
      targetMarket,
      founderName,
      industry,
      startupStage,
      problemStatement,
      usp,
      businessModel,
      revenueStrategy,
      budget,
      location,
      teamSize,
      competitors,
      shortGoals,
      longGoals,
      marketingPlan,
      additionalNotes
    } = req.body;

    // Smart fallbacks for simpler landing page input or missing fields
    const activeFounderName = founderName || req.user?.name || "Founder";
    const activeIdeaDescription = ideaDescription || req.body.businessIdea || "N/A";
    const activeTargetMarket = targetMarket || req.body.targetAudience || "N/A";

    // Create a pending report first
    const report = await FeasibilityReport.create({
      user: req.user._id,
      startupName,
      ideaDescription: activeIdeaDescription,
      targetMarket: activeTargetMarket,
      founderName: activeFounderName,
      industry: industry || "N/A",
      startupStage: startupStage || "Ideation / Pre-Seed",
      problemStatement: problemStatement || "N/A",
      usp: usp || "N/A",
      businessModel: businessModel || "N/A",
      revenueStrategy: revenueStrategy || "N/A",
      budget: budget || "N/A",
      location: location || "N/A",
      teamSize: teamSize || "1",
      competitors: competitors || "N/A",
      shortGoals: shortGoals || "N/A",
      longGoals: longGoals || "N/A",
      marketingPlan: marketingPlan || "N/A",
      additionalNotes: additionalNotes || "N/A",
    });
    reportId = report._id;

    const prompt = `
You are an expert startup consultant, business strategist, financial analyst, investor advisor, and market research expert.
Your task is to generate a REALISTIC, PROFESSIONAL, INVESTOR-READY BUSINESS REPORT for the startup "${startupName}" based on the founder inputs.

---------------------------------------------------
USER INPUT DATA
---------------------------------------------------
Startup Name: ${startupName}
Founder Name: ${activeFounderName}
Industry: ${industry || "N/A"}
Startup Stage: ${startupStage || "Ideation / Pre-Seed"}
Business Idea: ${activeIdeaDescription}
Problem Statement: ${problemStatement || "N/A"}
Target Audience: ${activeTargetMarket}
Unique Selling Proposition: ${usp || "N/A"}
Business Model: ${businessModel || "N/A"}
Revenue Strategy: ${revenueStrategy || "N/A"}
Current Budget: ${budget || "N/A"}
Location: ${location || "N/A"}
Team Size: ${teamSize || "1"}
Competitors: ${competitors || "N/A"}
Short-Term Goals: ${shortGoals || "N/A"}
Long-Term Vision: ${longGoals || "N/A"}
Marketing Plan: ${marketingPlan || "N/A"}
Additional Notes: ${additionalNotes || "N/A"}

---------------------------------------------------
IMPORTANT INSTRUCTIONS
---------------------------------------------------
1. Generate the report in PROFESSIONAL BUSINESS LANGUAGE.
2. Avoid generic motivational lines or boilerplate intros.
3. Give REAL-WORLD practical business suggestions and modern startup terminology (e.g. LTV/CAC, CAC payback, product-market fit, unit economics, PMF, regulatory sandboxes).
4. Provide realistic financial, monetization, and growth suggestions.
5. Make the report look investor-ready and polished.
6. Do not repeat user input unnecessarily.
7. Make the report feel premium and consultancy-grade (think McKinsey, Deloitte, or Y Combinator advisory).
8. Include strategic risks, realistic weaknesses, execution difficulties, and critical weaknesses. Think like a critical investor.
9. Keep sections analytical and detailed but concise and punchy to prevent output truncation.
10. Use clean markdown formatting.
11. Avoid emojis completely.
13. Make the output polished enough to export directly as PDF.

---------------------------------------------------
REQUIRED OUTPUT JSON FORMAT
---------------------------------------------------
Return ONLY a valid JSON object with the following structure:
{
  "overallScore": <number between 0 and 100 representing the AI success score based on market demand, competition, innovation, revenue potential, scalability, and execution complexity>,
  
  "marketAnalysis": "Generate sections 1 to 4 in clean markdown. Keep it long-form, highly detailed, and analytical:
# 1. Executive Summary
- Startup overview
- Vision
- Market opportunity
- Business potential
- Growth possibilities

# 2. Problem & Market Gap Analysis
- What exact problem the startup solves
- Why existing solutions are insufficient
- Current market gap
- Why users will switch

# 3. Target Audience Analysis
- Primary audience
- Secondary audience
- User behavior
- Pain points
- Customer psychology
- Buying behavior

# 4. Industry & Market Analysis
- Industry overview
- Current market trends
- Future opportunities
- Industry risks
- Estimated market potential
- Scalability possibilities",

  "competitorOverview": "Generate sections 5 to 6 in clean markdown:
# 5. Competitor Analysis
Create a beautifully formatted markdown table comparing this startup against key competitors on strengths, weaknesses, pricing style, market position, and competitive advantage.

# 6. SWOT Analysis
Generate detailed, critical analysis of:
- Strengths
- Weaknesses
- Opportunities
- Threats",

  "revenueProjection": "Generate sections 7, 9, and 10 in clean markdown:
# 7. Business Model Analysis
- Revenue generation strategy
- Monetization model
- Customer acquisition strategy
- Retention strategy
- Scalability of model

# 9. Marketing & Growth Strategy
- Social media strategy
- Organic growth
- Paid marketing
- SEO strategy
- Influencer strategy
- Community building
- Partnership opportunities
- Brand positioning

# 10. Financial Overview
Generate realistic projections:
- Estimated startup cost
- Monthly operational cost
- Revenue prediction
- Break-even estimation
- Profitability timeline
- Provide a clean markdown table showing realistic Year 1, Year 2, and Year 3 projections (revenues, expenses, profits).",

  "riskAssessment": "Generate sections 8, 11, 12, 13, 14, 15, and 16 in clean markdown:
# 8. AI-Based Startup Success Score
- Analysis of the overall score
- Breakdown by Market demand, Competition, Innovation, Revenue potential, Scalability, and Execution complexity
- Key improvement areas

# 11. Funding & Investment Readiness
- Whether startup is investment-ready
- Ideal funding stage
- Possible investor types
- Funding risks
- Investor attraction strategy

# 12. Product Development Roadmap
Generate a clean timeline-based markdown structure:
- MVP stage
- Beta launch
- Scaling phase
- Expansion phase

# 13. Risk Analysis
- Business risks and mitigation
- Technical risks and mitigation
- Market risks and mitigation
- Financial risks and mitigation
- Legal/compliance risks and mitigation

# 14. Operational Strategy
- Team structure
- Hiring priorities
- Tech stack recommendations
- Daily operations flow
- Customer support strategy

# 15. Final Strategic Recommendations
- Top priorities
- Immediate next steps
- High-impact improvements
- Long-term scalability advice
- Founder guidance

# 16. Final Conclusion
- Startup potential summary
- Market viability
- Long-term sustainability
- Strategic growth outlook"
}

Do not add any markdown code block wrap (such as \`\`\`json) outside the JSON unless requested, just return the JSON object directly.
`;

    console.log("Requesting AI completion...");
    const completion = await openai.chat.completions.create({
      model: isGeminiKey ? "models/gemini-2.5-flash" : "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional startup consultant. Response must be in valid JSON format." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 8192
    });

    const content = completion.choices[0].message.content;
    const aiResult = parseAIResponse(content);

    report.aiReport = aiResult;
    report.status = "generated";
    await report.save();

    res.status(201).json(report);
  } catch (error) {
    console.error("GENERATE_REPORT_ERROR:", error.message);
    if (error.status) console.error("Error Status:", error.status);
    if (error.response?.data) console.error("Error Response Data:", JSON.stringify(error.response.data));
    
    // If we created a report but generation failed, update status or delete it
    if (reportId) {
       await FeasibilityReport.findByIdAndDelete(reportId).catch(err => console.error("Error cleaning up report:", err));
    }

    // Map AI service 404 (model not found) to 502 Bad Gateway to avoid confusing the UI/Router into thinking the Express route is missing
    let status = error.status || 500;
    if (status === 404) status = 502;
    const message = error.message || "Internal Server Error during report generation";
    
    res.status(status).json({ message });
  }
};




// @route GET /api/feasibility/my
// Get all reports for the logged-in user
export const getMyReports = async (req, res, next) => {
  try {
    const reports = await FeasibilityReport.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/feasibility/:id
export const getReportById = async (req, res, next) => {
  try {
    const report = await FeasibilityReport.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!report) {
      res.status(404);
      throw new Error("Report not found");
    }

    // Only owner can view
    if (report.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this report");
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/feasibility/:id
export const deleteReport = async (req, res, next) => {
  try {
    const report = await FeasibilityReport.findById(req.params.id);

    if (!report) {
      res.status(404);
      throw new Error("Report not found");
    }

    // Only owner can delete
    if (report.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this report");
    }

    await report.deleteOne();
    res.json({ message: "Report removed" });
  } catch (error) {
    next(error);
  }
};

