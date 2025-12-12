import express from "express";

import { userController } from "../controllers/userController.js";

import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authorize("user", "admin"), userController.authMe);

router.get("/assignees", authorize("user"), userController.getAssignees);

export default router;
