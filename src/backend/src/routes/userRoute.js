import express from "express";

import { userController } from "../controllers/userController.js";

import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authorize("project manager", "admin", "assignee"), userController.authMe);

router.get('/assignees', authorize('admin', 'project manager'), userController.getAssignees);

export default router;
