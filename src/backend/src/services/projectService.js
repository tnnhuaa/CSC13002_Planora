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

    async getProjectByManager(manager) {
        return await projectRepository.findByManager(manager);
    }
}

export const projectService = new ProjectService();