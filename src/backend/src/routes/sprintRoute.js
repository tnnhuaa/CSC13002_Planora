import express from "express";
import { sprintController } from "../controllers/sprintController.js";
import { protectedRoute, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all sprints
router.get("/", protectedRoute, authorize("user"), sprintController.getAllSprints);

// Get sprints by project
router.get("/project/:projectId", protectedRoute, authorize("user"), sprintController.getSprintsByProject);

// Get sprint by ID
router.get("/:id", protectedRoute, authorize("user"), sprintController.getSprintById);

// Get sprint statistics
router.get("/:id/stats", protectedRoute, authorize("user"), sprintController.getSprintStats);

// Create sprint
router.post("/", protectedRoute, authorize("user"), sprintController.createSprint);

// Update sprint
router.put("/:id", protectedRoute, authorize("user"), sprintController.updateSprint);

// Delete sprint
router.delete("/:id", protectedRoute, authorize("user"), sprintController.deleteSprint);

// Start sprint (change status to active)
router.post("/:id/start", protectedRoute, authorize("user"), sprintController.startSprint);

// Complete sprint (change status to completed)
router.post("/:id/complete", protectedRoute, authorize("user"), sprintController.completeSprint);

// Add issue to sprint
router.post("/:id/issues", protectedRoute, authorize("user"), sprintController.addIssueToSprint);

// Remove issue from sprint
router.delete("/:id/issues", protectedRoute, authorize("user"), sprintController.removeIssueFromSprint);

export default router;
