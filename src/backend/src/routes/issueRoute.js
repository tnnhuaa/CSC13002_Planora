import express from "express";

import { issueController } from "../controllers/issueController.js";

import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create issue
router.post("/", authorize("user"), issueController.create);

// Get issues (Controller handle role)
router.get("/", authorize("user"), issueController.getIssuesForUser);

// Get issue by project
router.get(
  "/project/:projectId",
  authorize("user"),
  issueController.getIssuesByProject
);

// Get issues by id
router.get("/:id", authorize("user"), issueController.getIssueById);
// Update
router.put("/:id", authorize("user"), issueController.updateIssue);

// Delete soon
// router.delete(
//   "/:id",
//   authorize("project manager"),
//   issueController.deleteissue
// );

export default router;
