import express from "express";

import { projectController } from '../controllers/projectController.js';

import { protectedRoute, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create project => role = 'project manager'
router.post('/', authorize('project manager'), projectController.create);

// Get all projects
router.get('/', projectController.getAllProject);

// Get projects by manager
router.get('/manager/:managerId', projectController.getProjectByManager);

export default router;