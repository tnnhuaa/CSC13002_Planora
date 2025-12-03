import Project from '../models/Project.js';
import Task from '../models/Task.js';

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
            .populate('manager', "username email avatarURL")
            .populate('members', 'username email avatarURL')
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return await Project.findById(id)
            .populate('manager', "username email avatarURL")
            .populate('members', 'username email avatarURL');
    }

    async findByManager(manager) {
        return await Project.find({ manager: manager })
            .populate('manager', "username email avatarURL")
            .populate('members', 'username email avatarURL')
            .sort({ createdAt: -1 });
    }

    async findByAssignee (assigneeId) {
        const projectIds = await Task.find({ assignee: assigneeId }).distinct('project');

        const projects = await Project.find({ _id: { $in: projectIds } })
            .populate('manager', 'username email')
            .populate('members', 'username email avatarURL')
            .sort({ createdAt: -1 });

        return projects;
    }

    async update(id, updateData) {
        return await Project.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
        });
    }

    async delete(id) {
        return await Project.findByIdAndDelete(id);
    }
}

export const projectRepository = new ProjectRepository();