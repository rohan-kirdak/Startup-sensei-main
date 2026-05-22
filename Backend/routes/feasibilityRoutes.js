import express from "express";
import {
  generateReport,
  getMyReports,
  getReportById,
  deleteReport,
} from "../controllers/feasibilityController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateReport);
router.get("/my", protect, getMyReports);
router.get("/:id", protect, getReportById);
router.delete("/:id", protect, deleteReport);

export default router;

