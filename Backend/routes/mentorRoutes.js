import express from "express";
import {
  applyAsMentor,
  getAllMentors,
  getMentorById,
  approveMentor,
  reviewMentor,
} from "../controllers/mentorController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllMentors);
router.get("/:id", getMentorById);
router.post("/apply", protect, applyAsMentor);
router.put("/:id/approve", protect, adminOnly, approveMentor);
router.post("/:id/review", protect, reviewMentor);

export default router;
