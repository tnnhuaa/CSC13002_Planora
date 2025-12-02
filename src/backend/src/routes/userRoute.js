import express from "express";

import { authMe } from "../controllers/userController.js";

import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authorize("project manager", "admin", "assignee"), authMe);

export default router;
