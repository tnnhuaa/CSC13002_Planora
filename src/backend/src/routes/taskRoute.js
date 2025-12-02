import express from "express";

import { taskController } from '../controllers/taskController.js';

import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create task
router.post('/', authorize('admin', 'project manager', 'assignee'), taskController.create);

// Get all tasks
router.get('/', authorize('admin'), taskController.getAllTasks);

// Get task by project
router.get('/project/:projectId', taskController.getTasksByProject);

// Get task by assignee
router.get('/assignee/:userId', taskController.getTasksByAssignee);

// Get tasks by id
router.get('/:id', taskController.getTaskById);

// Update
router.put('/:id', authorize('admin', 'project manager', 'assignee'), taskController.updateTask);

// Delete
router.delete('/:id', authorize('admin', 'project manager'), taskController.deleteTask);

export default router;