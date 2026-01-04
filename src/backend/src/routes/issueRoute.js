import express from "express";

import { issueController } from "../controllers/issueController.js";

import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create issue
router.post("/", authorize("user"), issueController.create);
router.post("/project/:projectId", authorize("user"), issueController.create);

router.get(
  "/project/:projectId/backlog",
  authorize("user"),
  issueController.getBacklogByProject
);
router.get(
  "/project/:projectId/board",
  authorize("user"),
  issueController.getBoardByProject
);

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

router.delete("/:id", authorize("user"), issueController.deleteIssue);

export default router;
