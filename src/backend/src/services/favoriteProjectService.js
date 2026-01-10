import { favoriteProjectRepository } from "../repositories/favoriteProjectRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { projectMembersRepository } from "../repositories/projectMembersRepository.js";

class FavoriteProjectService {
  async addToFavorites(userId, projectId) {
    // Ensure project exists
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Only allow members to favorite projects they belong to
    const isMember = await projectMembersRepository.existsMember(projectId, userId);
    if (!isMember) {
      throw new Error("User is not a member of this project");
    }

    // Avoid duplicate favorites
    const existing = await favoriteProjectRepository.findByUserAndProject(userId, projectId);
    if (existing) {
      return existing;
    }

    return favoriteProjectRepository.create(userId, projectId);
  }

  async removeFromFavorites(userId, projectId) {
    const deleted = await favoriteProjectRepository.delete(userId, projectId);
    if (!deleted) {
      throw new Error("Favorite not found");
    }
    return deleted;
  }

  async getUserFavorites(userId) {
    const favorites = await favoriteProjectRepository.findByUser(userId);
    // Return projects with favorite metadata so UI can render both
    return favorites.map((favorite) => ({
      favoriteId: favorite._id,
      project: favorite.project,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
    }));
  }
}

export const favoriteProjectService = new FavoriteProjectService();
