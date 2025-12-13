import Issue from "../models/Issue.js";
import Project from "../models/Project.js";

class IssueRepository {
  async generateIssueKey(projectId) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Project not found to generate issue key");

    const lastIssue = await Issue.findOne({ project: projectId }).sort({
      createdAt: -1,
    });
    let newNumber = 1;
    if (lastIssue && lastIssue.key) {
      const lastNumber = parseInt(lastIssue.key.split("-")[1]);
      if (!isNaN(lastNumber)) {
        newNumber = lastNumber + 1;
      }
    }

    return `${project.key}-${newNumber}`;
  }

  async create(issueData) {
    issueData.key = await this.generateIssueKey(issueData.project);

    return await Issue.create(issueData);
  }

  async findAll(filter = {}) {
    return await Issue.find(filter)
      .populate("assignee", "username email avatarURL")
      .populate("reporter", "username email")
      .populate("project", "title key");
  }

  async findById(id) {
    return await Issue.findById(id)
      .populate("assignee", "username email avatarURL")
      .populate("reporter", "username email")
      .populate("project")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username avatarURL" },
      });
  }

  async findByAssigneeId(userId) {
    return await Issue.find({ assignee: userId })
      .populate("assignee reporter", "username email avatarURL")
      .populate("project", "title key");
  }

  async findByProjects(projectIds) {
    return await Issue.find({ project: { $in: projectIds } })
      .populate("assignee reporter", "username email avatarURL")
      .sort({ createdAt: -1 });
  }

  async update(id, updateData) {
    return await Issue.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // async delete(id) {
  //   return await Issue.findByIdAndDelete(id);
  // }
}

export const issueRepository = new IssueRepository();
