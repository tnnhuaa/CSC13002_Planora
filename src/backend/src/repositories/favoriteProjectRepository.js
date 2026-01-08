import FavoriteProject from "../models/FavoriteProject.js";

class FavoriteProjectRepository {
  async findByUserAndProject(userId, projectId) {
    return FavoriteProject.findOne({ user: userId, project: projectId });
  }

  async create(userId, projectId) {
    const favorite = new FavoriteProject({ user: userId, project: projectId });
    return favorite.save();
  }

  async delete(userId, projectId) {
    return FavoriteProject.findOneAndDelete({ user: userId, project: projectId });
  }

  async findByUser(userId) {
    return FavoriteProject.find({ user: userId }).populate({
      path: "project",
      populate: { path: "manager", select: "username email" },
    });
  }

  async findByProject(projectId) {
    return FavoriteProject.find({ project: projectId });
  }
}

export const favoriteProjectRepository = new FavoriteProjectRepository();
