import express from "express";
import {
  createComment,
  getCommentsByIssue,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// Create a new comment
router.post("/", createComment);

// Get comments by issue
router.get("/issue/:issueId", getCommentsByIssue);

// Update a comment
router.put("/:commentId", updateComment);

// Delete a comment
router.delete("/:commentId", deleteComment);

export default router;
