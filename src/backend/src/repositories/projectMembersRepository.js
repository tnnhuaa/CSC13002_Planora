import { ProjectMember } from '../models/Project.js';

class ProjectMembersRepository {
    async addMember(projectId, userId, role, session = null) {
        const member = new ProjectMember({ project: projectId, user: userId, role });
        return member.save({ session });
    }

    async removeMember(projectId, userId, session = null) {
        return ProjectMember.deleteOne({ project: projectId, user: userId }).session(session);
    }

    async existsMember(projectId, userId, session = null) {
        const count = await ProjectMember.countDocuments({ project: projectId, user: userId }).session(session);
        return count > 0;
    }

    async findMembersByProject(projectId, session = null) {
        return ProjectMember.find({ project: projectId })
            .populate('user', 'username email')
            .session(session);
    }

    async updateMemberRole(projectId, userId, newRole, session = null) {
        return ProjectMember.findOneAndUpdate(
            { project: projectId, user: userId },
            { role: newRole },
            { new: true }
        ).session(session);
    }

    async findProjectsByUser(userId, session = null) {
        return ProjectMember.find({ user: userId })
            .populate('project')
            .session(session);
    }
}

export const projectMembersRepository = new ProjectMembersRepository();