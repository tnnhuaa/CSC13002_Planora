import { taskService } from '../services/taskService.js';

class TaskController {
    async create(req, res) {
        try {
            const reporterId = req.user._id;
            
            const taskData = {
                ...req.body,
                reporter: reporterId
            };

            const createdTask = await taskService.create(taskData);

            return res.status(201).json({
                message: 'Create task successfully!',
                data: createdTask
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getAllTasks(req, res) {
        try {
            const filter = req.query;
            const tasks = await taskService.getAllTasks(filter);

            return res.status(200).json({
                message: 'Get all tasks successfully!',
                data: tasks
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await taskService.getTaskById(id);

            return res.status(200).json({
                message: 'Get task details successfully!',
                data: task
            });
        } catch (error) {
            const statusCode = error.message === "Task not found!" ? 404 : 400;
            return res.status(statusCode).json({ message: error.message });
        }
    }

    async getTasksByProject(req, res) {
        try {
            const { projectId } = req.params;
            const tasks = await taskService.getTasksByProject(projectId);

            return res.status(200).json({
                message: `Get tasks for project ${projectId} successfully!`,
                data: tasks
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async getTasksByAssignee(req, res) {
        try {
            const userId = req.params.userId || req.user._id; 
            
            const tasks = await taskService.getTasksByAssignee(userId);

            return res.status(200).json({
                message: 'Get assigned tasks successfully!',
                data: tasks
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const currentUser = req.user;

            const updatedTask = await taskService.updateTask(id, updateData, currentUser);

            return res.status(200).json({
                message: 'Update task successfully!',
                data: updatedTask
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async deleteTask(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.user;

            await taskService.deleteTask(id, currentUser);

            return res.status(200).json({
                message: 'Delete task successfully!'
            });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

export const taskController = new TaskController();