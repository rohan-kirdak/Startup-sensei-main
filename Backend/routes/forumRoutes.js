import express from "express";
import {
  createPost,
  getAllPosts,
  getPostById,
  toggleLike,
  addComment,
  deletePost,
} from "../controllers/forumController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", protect, createPost);
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);
router.delete("/:id", protect, deletePost);

export default router;
