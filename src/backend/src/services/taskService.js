import { taskRepository } from '../repositories/taskRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';

class TaskService {
    async checkTaskPermission(taskId, user) {
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found!");

        const projectId = task.project._id || task.project;
        const project = await projectRepository.findById(projectId);
        if (!project) throw new Error("Project associated with this task not found!");

        // Check role
        const isAdmin = user.role === 'admin';
        
        const isAssignee = task.assignee && task.assignee._id.toString() === user._id.toString();
        
        const isProjectManager = project.manager.toString() === user._id.toString();

        const isReporter = task.reporter && task.reporter._id.toString() === user._id.toString();

        if (!isAdmin && !isAssignee && !isProjectManager && !isReporter) {
            throw new Error("Access denied! You are not authorized to perform this action.");
        }

        return task;
    }

    async create(taskData) {
        const { title, project, assignee, reporter } = taskData;

        // Validate input
        if (!title || !project || !assignee || !reporter) {
            throw new Error("Title, project, assignee, and reporter are required!");
        }

        // Validate project
        const projectExists = await projectRepository.findById(project);
        if (!projectExists) {
            throw new Error("Project not found! Cannot create task.");
        }

        return await taskRepository.create(taskData);     
    }

    async getAllTasks(filter = {}) {
        return await taskRepository.findAll(filter);
    }

    async getTaskById(id) {
        const task = await taskRepository.findById(id);

        if (!task) {
            throw new Error("Task not found!");
        }
        return task;
    }

    async getTasksByAssignee(userId) {
        return await taskRepository.findByAssigneeId(userId);
    }

    async getTasksByProject(projectIds) {
        return await taskRepository.findByProjects(projectIds);
    }

    async updateTask(id, updateData, user) {
        // Validate data
        if (updateData.project) {
            delete updateData.project; 
        }
        
        if (updateData.key) {
            delete updateData.key;
        }

        await this.checkTaskPermission(id, user);

        const updatedTask = await taskRepository.update(id, updateData);
        if (!updatedTask) {
            throw new Error("Task not found to update!");
        }

        return updatedTask;
    }

    async deleteTask(id, user) {
        await this.checkTaskPermission(id, user);

        const deletedTask = await taskRepository.delete(id);
        
        if (!deletedTask) {
            throw new Error("Task not found to delete!");
        }

        return deletedTask;
    }
}

export const taskService = new TaskService();