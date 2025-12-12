import Project from "../models/Project.js";
import Issue from "../models/Issue.js";

class ProjectRepository {
  async generateKey() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100);
    return `PROJ${timestamp}${random}`;
  }

  async create(projectData) {
    projectData.key = await this.generateKey();

    return await Project.create(projectData);
  }

  async findAll(filter = {}) {
    return await Project.find(filter)
      .populate("manager", "username email avatarURL")
      .populate("members", "username email avatarURL")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Project.findById(id)
      .populate("manager", "username email avatarURL")
      .populate("members", "username email avatarURL");
  }

  async findByManager(manager) {
    return await Project.find({ manager: manager })
      .populate("manager", "username email avatarURL")
      .populate("members", "username email avatarURL")
      .sort({ createdAt: -1 });
  }

  async findByMember(userId) {
    return await Project.find({ members: userId })
      .populate("manager", "username email avatarURL")
      .populate("members", "username email avatarURL")
      .sort({ createdAt: -1 });
  }

  // Including all PM and team member
  async findInvolved(userId) {
    return await Project.find({
      $or: [
        { manager: userId },
        { members: userId }, // Mongoose tự động check userId có nằm trong mảng members hay không
      ],
    })
      .populate("manager", "username email avatarURL")
      .populate("members", "username email avatarURL")
      .sort({ createdAt: -1 });
  }

  async update(id, updateData) {
    return await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Project.findByIdAndDelete(id);
  }
}

export const projectRepository = new ProjectRepository();
