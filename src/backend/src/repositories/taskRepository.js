import Task from "../models/Task.js";
import Project from "../models/Project.js";

class TaskRepository {
    async generateTaskKey(projectId) {
        const project = await Project.findById(projectId);
        if (!project) throw new Error("Project not found to generate task key");

        const lastTask = await Task.findOne({ project: projectId }).sort({ createdAt: -1 });
        let newNumber = 1;
        if (lastTask && lastTask.key) {
            const lastNumber = parseInt(lastTask.key.split('-')[1]);
            if (!isNaN(lastNumber)) {
                newNumber = lastNumber + 1;
            }
        }

        return `${project.key}-${newNumber}`;
    }

    async create(taskData) {
        taskData.key = await this.generateTaskKey(taskData.project);

        return await Task.create(taskData);
    }

    async findAll(filter = {}) {
        return await Task
        .find(filter)
        .populate("assignee", "username email avatarURL")
        .populate("reporter", "username email")
        .populate("project", "title key");
    }

    async findById(id) {
        return await Task
        .findById(id)
        .populate("assignee", "username email avatarURL")
        .populate("reporter", "username email")
        .populate("project")
        .populate({
            path: "comments",
            populate: { path: "user", select: "username avatarURL" }
        });
    }

    async findByAssigneeId(userId) {
        return await Task
        .find({ assignee: userId })
        .populate("assignee reporter", "username email avatarURL")
        .populate("project", "title key");
    }

    async findByProjectId(projectId) {
        return await Task
        .find({ project: projectId })
        .populate("assignee reporter", "username email avatarURL")
        .sort({ createdAt: -1 });
    }

    async update(id, updateData) {
        return await Task.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await Task.findByIdAndDelete(id);
    }
}

export const taskRepository = new TaskRepository();