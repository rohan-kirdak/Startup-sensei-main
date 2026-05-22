import OpenAI from "openai";
import ChatSession from "../model/ChatSession.js";

const isGeminiKey = process.env.OPENAI_API_KEY?.startsWith("AIzaSy");
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: isGeminiKey 
    ? "https://generativelanguage.googleapis.com/v1beta/openai" 
    : undefined 
});

// System prompt — this is what makes it a "Startup Sensai" advisor
const SYSTEM_PROMPT = `
You are Sensai, an expert AI startup advisor inside the Startup Sensai platform.
Your job is to help founders turn their ideas into actionable plans.

When a founder describes their startup idea, you:
1. Analyze the market opportunity and target audience
2. Suggest a go-to-market strategy tailored to their idea
3. Recommend a funding roadmap (bootstrapping, angel, VC, grants)
4. Provide growth milestones for 3, 6, and 12 months
5. Suggest the best tech stack if they are building a product
6. Give 3-5 concrete next steps they can take this week

Always be specific, actionable, and encouraging.
Ask clarifying questions if the idea is vague.
Format long plans with clear sections using markdown headings.
Never give generic advice — tie everything back to their specific idea.
`;

// @route POST /api/chat/start
// Start a new chat session for a startup idea
export const startChatSession = async (req, res, next) => {
  try {
    const { startupName, ideaDescription, stage } = req.body;

    if (!ideaDescription) {
      res.status(400);
      throw new Error("Idea description is required to start a session");
    }

    // First message auto-generated to kick off the conversation
    const initialUserMessage = `
      My startup is called "${startupName || "my startup"}".
      Here's the idea: ${ideaDescription}.
      I am currently at the ${stage || "idea"} stage.
      Please analyze this and give me a full startup plan.
    `;

    const completion = await openai.chat.completions.create({
      model: isGeminiKey ? "gemini-flash-latest" : "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: initialUserMessage },
      ],
      max_tokens: 1500,
    });

    const assistantReply = completion.choices[0].message.content;

    // Save session with both messages
    const session = await ChatSession.create({
      user: req.user._id,
      startupName,
      ideaDescription,
      stage,
      messages: [
        { role: "user", content: initialUserMessage },
        { role: "assistant", content: assistantReply },
      ],
    });

    res.status(201).json({
      sessionId: session._id,
      reply: assistantReply,
      stage: session.stage,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/chat/:sessionId/message
// Send a follow-up message in an existing session
export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { sessionId } = req.params;

    if (!message?.trim()) {
      res.status(400);
      throw new Error("Message cannot be empty");
    }

    const session = await ChatSession.findById(sessionId);

    if (!session) {
      res.status(404);
      throw new Error("Chat session not found");
    }

    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to access this session");
    }

    // Build full conversation history for OpenAI (gives it memory)
    const conversationHistory = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Append new user message
    conversationHistory.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: isGeminiKey ? "gemini-flash-latest" : "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory,
      ],
      max_tokens: 1000,
    });

    const assistantReply = completion.choices[0].message.content;

    // Persist both new messages to DB
    session.messages.push({ role: "user", content: message });
    session.messages.push({ role: "assistant", content: assistantReply });
    await session.save();

    res.json({
      sessionId: session._id,
      reply: assistantReply,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/chat/:sessionId/generate-plan
// Extract a structured plan from the conversation and save it
export const generateStructuredPlan = async (req, res, next) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);

    if (!session) {
      res.status(404);
      throw new Error("Chat session not found");
    }

    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized");
    }

    // Summarize the entire conversation into a structured plan
    const conversationText = session.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const planPrompt = `
      Based on this startup advisory conversation, extract a structured plan.
      Return ONLY a valid JSON object with this exact structure:
      {
        "marketingStrategy": "detailed marketing strategy",
        "fundingRoadmap": "step by step funding plan",
        "growthMilestones": "3, 6, and 12 month milestones",
        "techRecommendations": "recommended tech stack and tools",
        "nextSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"]
      }

      Conversation:
      ${conversationText}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: planPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const plan = JSON.parse(completion.choices[0].message.content);

    session.generatedPlan = plan;
    await session.save();

    res.json({
      message: "Plan generated successfully",
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/chat/my
// Get all chat sessions for the logged-in user
export const getMyChatSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id })
      .select("-messages") // exclude message history for listing
      .sort({ updatedAt: -1 });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/chat/:sessionId
// Get full session with message history
export const getChatSessionById = async (req, res, next) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId).populate(
      "user",
      "name profilePic",
    );

    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    if (session.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized");
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/chat/sensai/widget
// Get or create a persistent "Sensai Widget" session for the founder
export const getWidgetSession = async (req, res, next) => {
  try {
    let session = await ChatSession.findOne({ 
      user: req.user._id, 
      startupName: "Sensai Widget" 
    });

    if (!session) {
      const initialReply = "Hello! I'm Sensai, your quick-access startup assistant. How can I help you today?";
      session = await ChatSession.create({
        user: req.user._id,
        startupName: "Sensai Widget",
        ideaDescription: "General startup advice and support via side widget",
        messages: [
          { role: "assistant", content: initialReply }
        ]
      });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/chat/:sessionId
export const deleteChatSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findById(req.params.sessionId);

    if (!session) {
      res.status(404);
      throw new Error("Session not found");
    }

    if (session.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized");
    }

    await session.deleteOne();
    res.json({ message: "Chat session deleted" });
  } catch (error) {
    next(error);
  }
};
