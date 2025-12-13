import express from "express";

import { userController } from "../controllers/userController.js";

import { protectedRoute, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/me",
  protectedRoute,
  authorize("user", "admin"),
  userController.authMe
);

router.get(
  "/assignees",
  protectedRoute,
  authorize("user"),
  userController.getAssignees
);

export default router;
