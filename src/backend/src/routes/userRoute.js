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

// Create user
router.post("/", protectedRoute, authorize("admin"), userController.createUser);

// Update user
router.put(
  "/:id",
  protectedRoute,
  authorize("admin"),
  userController.updateUser
);

// Delete user
router.delete(
  "/:id",
  protectedRoute,
  authorize("admin"),
  userController.deleteUser
);

// Ban user
router.patch(
  "/:id/ban",
  protectedRoute,
  authorize("admin"),
  userController.banUser
);

export default router;
