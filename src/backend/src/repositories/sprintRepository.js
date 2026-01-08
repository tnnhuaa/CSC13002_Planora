import Sprint from "../models/Sprint.js";
import Issue from "../models/Issue.js";

class SprintRepository {
  async create(sprintData) {
    const sprint = new Sprint(sprintData);
    return await sprint.save();
  }

  async findAll(filter = {}) {
    return await Sprint.find(filter)
      .populate("project", "name key")
      .sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Sprint.findById(id)
      .populate("project", "name key description manager")
      .populate({
        path: "issues",
        populate: [
          { path: "assignee", select: "username email avatarURL" },
          { path: "reporter", select: "username email" },
        ],
      });
  }

  async findByProject(projectId) {
    return await Sprint.find({ project: projectId })
      .populate({
        path: "issues",
        populate: [
          { path: "assignee", select: "username email avatarURL" },
          { path: "reporter", select: "username email" },
        ],
      })
      .sort({ createdAt: -1 });
  }

  async findActiveSprints(projectId) {
    return await Sprint.find({ project: projectId, status: "active" })
      .populate({
        path: "issues",
        populate: [
          { path: "assignee", select: "username email avatarURL" },
          { path: "reporter", select: "username email" },
        ],
      })
      .sort({ start_date: -1 });
  }

  async update(id, updateData) {
    return await Sprint.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("project", "name key")
      .populate({
        path: "issues",
        populate: [
          { path: "assignee", select: "username email avatarURL" },
          { path: "reporter", select: "username email" },
        ],
      });
  }

  async delete(id) {
    return await Sprint.findByIdAndDelete(id);
  }

  async addIssueToSprint(sprintId, issueId) {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    if (!sprint.issues.includes(issueId)) {
      sprint.issues.push(issueId);
      await sprint.save();
    }

    // Update issue to reference sprint
    await Issue.findByIdAndUpdate(issueId, { sprint: sprintId });

    return sprint;
  }

  async removeIssueFromSprint(sprintId, issueId) {
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    sprint.issues = sprint.issues.filter(
      (id) => id.toString() !== issueId.toString()
    );
    await sprint.save();

    // Remove sprint reference from issue
    await Issue.findByIdAndUpdate(issueId, { $unset: { sprint: "" } });

    return sprint;
  }

  async getSprintStats(sprintId) {
    const sprint = await this.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    const totalIssues = sprint.issues.length;
    const completedIssues = sprint.issues.filter(
      (issue) => issue.status === "done"
    ).length;
    const inProgressIssues = sprint.issues.filter(
      (issue) => issue.status === "in_progress"
    ).length;
    const todoIssues = sprint.issues.filter(
      (issue) => issue.status === "todo"
    ).length;

    const totalStoryPoints = sprint.issues.reduce(
      (sum, issue) => sum + (issue.story_points || 0),
      0
    );
    const completedStoryPoints = sprint.issues
      .filter((issue) => issue.status === "done")
      .reduce((sum, issue) => sum + (issue.story_points || 0), 0);

    return {
      totalIssues,
      completedIssues,
      inProgressIssues,
      todoIssues,
      totalStoryPoints,
      completedStoryPoints,
      completionRate:
        totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0,
    };
  }
}

export const sprintRepository = new SprintRepository();
