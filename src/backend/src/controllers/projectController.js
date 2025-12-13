import { projectService } from "../services/projectService.js";

class ProjectController {
    async create(req, res) {
        try {
            const { members, ...projectData } = req.body;
            const managerId = req.user.id;

            const project = await projectService.createProject(projectData, managerId);

            // Add additional members if provided
            if (members && Array.isArray(members)) {
                for (const member of members) {
                    await projectService.addMemberToProject(project._id, member.userId, member.role);
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

            const member = await projectService.addMemberToProject(projectId, userId, role);
            res.status(201).json(member);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
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

            await projectService.removeMemberFromProject(projectId, userId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }    
    }

    async changeMemberRole(req, res) {
        try {
            const { projectId } = req.params;
            const { userId, newRole } = req.body;

            const updatedMember = await projectService.changeMemberRole(projectId, userId, newRole);
            res.status(200).json(updatedMember);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
  }

  async getUserProjects(req, res) {
    try {
      const userId = req.user._id || req.user.id;

      const projects = await projectService.getUserProjects(userId);

    async getProjectDetails(req, res) {
        try {
            const { projectId } = req.params;
            const userId = req.user.id;

            const project = await projectService.getProjectDetails(userId, projectId);
            res.status(200).json(project);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserProjects(req, res) {
        try {
            const userId = req.user.id;
            const projects = await projectService.getUserProjects(userId);
            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
  }
}

export const projectController = new ProjectController();
