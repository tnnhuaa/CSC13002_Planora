import { issueRepository } from "../repositories/issueRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";

class IssueService {
  async checkIssuePermission(issueId, user) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) throw new Error("Issue not found!");

    const projectId = issue.project._id || issue.project;
    const project = await projectRepository.findById(projectId);
    if (!project)
      throw new Error("Project associated with this issue not found!");

    const managerId = project.manager._id
      ? project.manager._id.toString()
      : project.manager.toString();

    const isAssignee =
      issue.assignee && issue.assignee._id.toString() === user._id.toString();

    const isProjectManager = managerId === user._id.toString();

    const isReporter =
      issue.reporter && issue.reporter._id.toString() === user._id.toString();

    if (!isAssignee && !isProjectManager && !isReporter) {
      throw new Error(
        "Access denied! You are not authorized to perform this action."
      );
    }

    return issue;
  }

  async create(issueData) {
    const { title, project, assignee, reporter } = issueData;

    // Validate input
    if (!title || !project || !assignee || !reporter) {
      throw new Error("Title, project, assignee, and reporter are required!");
    }

    // Validate project
    const projectExists = await projectRepository.findById(project);
    if (!projectExists) {
      throw new Error("Project not found! Cannot create issue.");
    }

    const reporterId = reporter.toString();
    const managerId = projectExists.manager._id
      ? projectExists.manager._id.toString()
      : projectExists.manager.toString();
    const memberIds = (projectExists.members || []).map((m) =>
      m._id ? m._id.toString() : m.toString()
    );

    const reporterIsParticipant =
      reporterId === managerId || memberIds.includes(reporterId);
    if (!reporterIsParticipant) {
      throw new Error(
        "Only project managers or members can create issues for this project."
      );
    }

    const assigneeId = assignee.toString();
    const assigneeIsParticipant =
      assigneeId === managerId || memberIds.includes(assigneeId);

    if (!assigneeIsParticipant) {
      throw new Error("Assignee must be a project manager or team member.");
    }

    return await issueRepository.create(issueData);
  }

  async getAllIssues(filter = {}) {
    return await issueRepository.findAll(filter);
  }

  async getIssueById(id) {
    const issue = await issueRepository.findById(id);

    if (!issue) {
      throw new Error("Issue not found!");
    }
    return issue;
  }

  async getIssuesByAssignee(userId) {
    return await issueRepository.findByAssigneeId(userId);
  }

  async getIssuesByProject(projectIds) {
    const ids = Array.isArray(projectIds) ? projectIds : [projectIds];
    return await issueRepository.findByProjects(ids);
  }

  async updateIssue(id, updateData, user) {
    // Validate data
    if (updateData.project) {
      delete updateData.project;
    }

    if (updateData.key) {
      delete updateData.key;
    }

    await this.checkIssuePermission(id, user);

    const updatedIssue = await issueRepository.update(id, updateData);
    if (!updatedIssue) {
      throw new Error("Issue not found to update!");
    }

    return updatedIssue;
  }

  // async deleteIssue(id, user) {
  //     await this.checkIssuePermission(id, user);

  //     const deletedIssue = await issueRepository.delete(id);

  //     if (!deletedIssue) {
  //         throw new Error("Issue not found to delete!");
  //     }

  //     return deletedIssue;
  // }
}

export const issueService = new IssueService();
