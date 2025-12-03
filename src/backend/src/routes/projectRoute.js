import express from "express";

import { projectController } from '../controllers/projectController.js';

import { protectedRoute, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create project => role = 'project manager'
router.post('/', authorize('project manager'), projectController.create);

// Get all projects
router.get('/', authorize('admin'), projectController.getAllProject);

// Get projects by manager
router.get('/manager/:managerId', authorize('admin', 'project manager'), projectController.getProjectByManager);

// Get my projects
router.get('/mine', authorize('project manager', 'assignee'), projectController.getMyProject);

// Delete
router.delete('/:id', authorize('admin', 'project manager'), projectController.deleteProject);

export default router;