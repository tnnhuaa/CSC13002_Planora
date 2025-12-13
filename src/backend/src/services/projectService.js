import { projectRepository } from "../repositories/projectRepository.js";
import { projectMembersRepository } from "../repositories/projectMembersRepository.js";

class ProjectService {
    async createProject(data, managerId) {
        const projectData = { ...data, manager: managerId };
        const project = await projectRepository.createProject(projectData);
        await projectMembersRepository.addMember(project._id, managerId, 'manager');
        return project;
    }

    async getProjectMembers(projectId) {
        return await projectMembersRepository.findMembersByProject(projectId);
    }

    async addMemberToProject(projectId, userId, role) {
        // Validate role
        const validRoles = ['manager', 'member', 'viewer'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role specified');
        }

        // Validate if member already exists
        const exists = await projectMembersRepository.existsMember(projectId, userId);
        if (exists) {
            throw new Error('User is already a member of the project');
        }

        return await projectMembersRepository.addMember(projectId, userId, role);
    }

    async removeMemberFromProject(projectId, userId) {
        // Validate if member exists
        const exists = await projectMembersRepository.existsMember(projectId, userId);
        if (!exists) {
            throw new Error('User is not a member of the project');
        }

        return await projectMembersRepository.removeMember(projectId, userId);
    }

    async changeMemberRole(projectId, userId, newRole) {
        // Validate role
        const validRoles = ['manager', 'member', 'viewer'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role specified');
        }

        // Validate if member exists
        const exists = await projectMembersRepository.existsMember(projectId, userId);
        if (!exists) {
            throw new Error('User is not a member of the project');
        }

        return await projectMembersRepository.updateMemberRole(projectId, userId, newRole);
    }

    async getProjectDetails(userId, projectId) {
        const project = await projectRepository.findProjectById(projectId);

        if (!project) {
            throw new Error('Project not found');
        }

        // Check user is a member of the project
        const isMember = await projectMembersRepository.existsMember(projectId, userId);

        if (!isMember) {
            throw new Error('User is not a member of the project');
        }

        // Fetch members
        const members = await projectMembersRepository.findMembersByProject(projectId);

        return { ...project.toObject(), members };
    }

    async getUserProjects(userId) {
        const projectMembers = await projectMembersRepository.findProjectsByUser(userId);

        const result = await Promise.all(projectMembers.map(async (pm) => {
            // Fetch members for each project
            const members = await projectMembersRepository.findMembersByProject(pm.project._id);
            return { ...pm.project.toObject(), members };
        }));

        return result;
    }
}

export const projectService = new ProjectService();