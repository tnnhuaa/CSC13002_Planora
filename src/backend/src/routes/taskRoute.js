import express from "express";

import { taskController } from '../controllers/taskController.js';

import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create task
router.post('/', authorize('admin', 'project manager'), taskController.create);

// Get tasks (Controller handle role)
router.get('/', authorize('admin', 'project manager', 'assignee'), taskController.getTasksForUser);

// Get task by project
router.get('/project/:projectId', authorize('admin', 'project manager', 'assignee'),  taskController.getTasksByProject);

// Get tasks by id
router.get('/:id', taskController.getTaskById);

// Update
router.put('/:id', authorize('admin', 'project manager', 'assignee'), taskController.updateTask);

// Delete
router.delete('/:id', authorize('admin', 'project manager'), taskController.deleteTask);

export default router;