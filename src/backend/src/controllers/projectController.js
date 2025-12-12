import { projectService } from "../services/projectService.js";

class ProjectController {
  async create(req, res) {
    try {
      const { members, ...projectData } = req.body;
      const managerId = req.user.id;

      const project = await projectService.createProject(
        projectData,
        managerId
      );

      // Add additional members if provided
      if (members && Array.isArray(members)) {
        for (const member of members) {
          await projectService.addMemberToProject(
            project._id,
            member.userId,
            member.role
          );
        }
      }

      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProjectMembers(req, res) {
    try {
      const { projectId } = req.params;
      const members = await projectService.getProjectMembers(projectId);
      res.status(200).json(members);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async addMember(req, res) {
    try {
      const { projectId } = req.params;
      const { userId, role } = req.body;

      const member = await projectService.addMemberToProject(
        projectId,
        userId,
        role
      );
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async removeMember(req, res) {
    try {
      const { projectId } = req.params;
      const { userId } = req.body;

      const projects = await projectService.getProjectByUser(_id, role);

      await projectService.removeMemberFromProject(projectId, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProjectDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const project = await projectService.getProjectById(id);
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const isManager = project.manager._id.toString() === userId.toString();
      const isMember = project.members.some(
        (member) => member._id.toString() === userId.toString()
      );

      if (!isManager && !isMember) {
        return res.status(403).json({
          message: "Access denied. You are not a member of this project.",
        });
      }

      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Validate manager
      if (
        req.user.role === "manager" &&
        req.user.id !== project.manager.toString()
      ) {
        return res.status(403).json({
          message: "You can only delete your own projects",
        });
      }

      await projectService.deleteProject(id);
      return res.status(200).json({
        message: "Delete project successfully!",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

export const projectController = new ProjectController();
