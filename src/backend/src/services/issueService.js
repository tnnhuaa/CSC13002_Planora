import { issueRepository } from "../repositories/issueRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { projectMembersRepository } from "../repositories/projectMembersRepository.js";
import userRepository from "../repositories/userRepository.js";
class IssueService {
  async checkIssuePermission(issueId, user) {
    const issue = await issueRepository.findById(issueId);
    if (!issue) throw new Error("Issue not found!");

    const projectId = issue.project._id || issue.project;
    const project = await projectRepository.findProjectById(projectId);
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

    await this.validateAssigneeNotBanned(assignee);

    const projectExists = await projectRepository.findProjectById(project);
    if (!projectExists) {
      throw new Error("Project not found! Cannot create issue.");
    }

    const projectMembers = await projectMembersRepository.findMembersByProject(
      project
    );

    const memberUserIds = projectMembers.map((member) =>
      String(member.user._id)
    );

    const managerId = String(projectExists.manager._id);
    const allParticipantIds = new Set([...memberUserIds, managerId]);

    const reporterId = String(reporter);
    const assigneeId = String(assignee);

    const reporterIsParticipant = allParticipantIds.has(reporterId);
    if (!reporterIsParticipant) {
      throw new Error(
        "Only project managers or members can create issues for this project."
      );
    }

    const assigneeIsParticipant = allParticipantIds.has(assigneeId);

    if (!assigneeIsParticipant) {
      throw new Error("Assignee must be a project manager or team member.");
    }

    return await issueRepository.create(issueData);
  }

  async validateAssigneeNotBanned(assigneeId) {
    const user = await userRepository.findById(assigneeId);
    if (!user) {
      throw new Error("Assignee user not found");
    }
    // - Status enum is ["inactive", "active", "banned"]
    if (user.status === "banned") {
      throw new Error("Cannot assign tasks to a banned user.");
    }
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

    if (updateData.assignee) {
      await this.validateAssigneeNotBanned(updateData.assignee);
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
