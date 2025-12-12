import { projectRepository } from "../repositories/projectRepository.js";

class ProjectService {
  async create(projectData) {
    const { title, manager } = projectData;

    // Validate
    if (!title || title.trim() === "") {
      throw new Error("Title is required!");
    }

    if (!manager) {
      throw new Error("Manager identifying failed!");
    }

    return await projectRepository.create(projectData);
  }

  async getAllProject() {
    return await projectRepository.findAll();
  }

  async getProjectById(projectId) {
    return await projectRepository.findById(projectId);
  }

  async getProjectByUser(userId) {
    return await projectRepository.findInvolved(userId);
  }

  async getProjectsByRole(userId, type) {
    if (type === "manager") {
      return await projectRepository.findByManager(userId);
    } else if (type === "member") {
      return await projectRepository.findByMember(userId);
    }
    return [];
  }

  async deleteProject(projectId) {
    return await projectRepository.delete(projectId);
  }
}

export const projectService = new ProjectService();
