import express from "express";

import { projectController } from "../controllers/projectController.js";

import { protectedRoute, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create project => role = 'project manager'
router.post("/", authorize("user"), projectController.create);

// Get all projects
router.get("/", authorize("user"), projectController.getAllProject);

// Get projects by manager
router.get(
  "/manager/:managerId",
  authorize("user"),
  projectController.getProjectByManager
);

// Get my projects
router.get("/mine", authorize("user"), projectController.getMyProject);

// Delete
router.delete("/:id", authorize("user"), projectController.deleteProject);

export default router;
