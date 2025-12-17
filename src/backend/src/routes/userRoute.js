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

router.get(
  "/allusers",
  protectedRoute,
  authorize("admin"),
  userController.getAllUser
);

export default router;
