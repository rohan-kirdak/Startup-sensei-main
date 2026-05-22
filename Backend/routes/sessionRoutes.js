import express from "express";
import {
  bookSession,
  getMySessions,
  updateSessionStatus,
  updatePaymentStatus,
} from "../controllers/sessionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/book", protect, bookSession);
router.get("/my", protect, getMySessions);
router.put("/:id/status", protect, updateSessionStatus);
router.put("/:id/payment", protect, updatePaymentStatus);

export default router;
