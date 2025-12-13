import express from "express";

import { projectController } from "../controllers/projectController.js";

import { protectedRoute, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// TODO: Add authorization middleware ('manager' - 'member' - 'viewer')

// Get all projects for current user
router.get("/mine", protectedRoute, projectController.getUserProjects);

// Create project
router.post("/", protectedRoute, projectController.create);

// Get Project Members ('manager' only)
router.get(
  "/:projectId/members",
  protectedRoute,
  projectController.getProjectMembers
);

// Add Member ('manager' only)
router.post("/:projectId/members", protectedRoute, projectController.addMember);

// Remove Member ('manager' only)
router.delete(
  "/:projectId/members",
  protectedRoute,
  projectController.removeMember
);

// Change Member Role ('manager' only)
router.put(
  "/:projectId/members/role",
  protectedRoute,
  projectController.changeMemberRole
);

// Get project details
router.get("/:projectId", protectedRoute, projectController.getProjectDetails);

export default router;
