import Project from "../models/Project.js";
import Issue from "../models/Issue.js";

class ProjectRepository {
  async generateKey() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100);
    return `PROJ${timestamp}${random}`;
  }

  async createProject(data) {
    const key = await this.generateKey();
    const project = new Project({ ...data, key });
    return project.save();
  }

  async findProjectsByManager(managerId) {
    return Project.find({ manager: managerId });
  }
  async findProjectById(id) {
    return Project.findById(id).populate("manager", "username email");
  }

  async findAllProjects() {
    return Project.find().populate("manager", "username email");
  }

  async findProjectsById(ids, session = null) {
    return Project.find({ _id: { $in: ids } })
      .populate("manager", "username email")
      .session(session);
  }

  async updateProject(id, data, session = null) {
    return Project.findByIdAndUpdate(id, data, { new: true }).session(session);
  }
}

export const projectRepository = new ProjectRepository();
