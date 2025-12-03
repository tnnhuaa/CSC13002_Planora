import { projectRepository } from "../repositories/projectRepository.js";

class ProjectService {
    async create(projectData) {
        const { title, manager } = projectData;

        // Validate
        if (!title || title.trim() === '') {
            throw new Error('Title is required!');
        }

        if (!manager) {
            throw new Error('Manager identifying failed!');
        }

        return await projectRepository.create(projectData);     
    }

    async getAllProject() {
        return await projectRepository.findAll();
    }

    async getProjectById(projectId) {
        return await projectRepository.findById(projectId);
    }

    async getProjectByUser(userId, role) {
        if (role === 'project manager') {
            return await projectRepository.findByManager(userId);
        }
        else if (role === 'assignee') {
            return await projectRepository.findByAssignee(userId);
        }
    }

    async deleteProject(projectId) {
        return await projectRepository.delete(projectId);
    }
}

export const projectService = new ProjectService();