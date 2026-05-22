import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  startConversation,
  editMessage,
  markAsRead,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/history/:conversationId", protect, getConversationMessages);
router.post("/send", protect, sendMessage);
router.get("/start/:receiverId", protect, startConversation);
router.put("/edit/:messageId", protect, editMessage);
router.put("/read/:conversationId", protect, markAsRead);

export default router;
