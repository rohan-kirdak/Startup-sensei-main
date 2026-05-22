import express from "express";
import {
  startChatSession,
  sendMessage,
  generateStructuredPlan,
  getMyChatSessions,
  getChatSessionById,
  deleteChatSession,
  getWidgetSession,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Session Management
router.post("/start", protect, startChatSession);
router.post("/:sessionId/message", protect, sendMessage);
router.post("/:sessionId/generate-plan", protect, generateStructuredPlan);

// Widget Persistent Session (Founder only)
router.get("/sensai/widget", protect, getWidgetSession);

// List and Detail
router.get("/my", protect, getMyChatSessions);
router.get("/:sessionId", protect, getChatSessionById);
router.delete("/:sessionId", protect, deleteChatSession);

export default router;
