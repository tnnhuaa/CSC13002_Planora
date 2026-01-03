import { issueRepository } from "../repositories/issueRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { projectMembersRepository } from "../repositories/projectMembersRepository.js";
import userRepository from "../repositories/userRepository.js";
import { sprintRepository } from "../repositories/sprintRepository.js";
class IssueService {
  async checkIssuePermission(issueId, user, action = "edit") {
    if (user.role === "admin") return true;

    const issue = await issueRepository.findById(issueId);
    if (!issue) throw new Error("Issue not found!");

    const projectId = issue.project._id || issue.project;
    const project = await projectRepository.findProjectById(projectId);
    if (!project)
      throw new Error("Project associated with this issue not found!");

    const isProjectOwner =
      project.manager._id.toString() === user._id.toString();

    const memberRole = await projectMembersRepository.getMemberRole(
      projectId,
      user._id
    );

    const isProjectManager = memberRole === "manager";
    const isProjectMember = memberRole === "member";

    const isAssignee =
      issue.assignee && issue.assignee._id.toString() === user._id.toString();
    const isReporter =
      issue.reporter && issue.reporter._id.toString() === user._id.toString();

    if (action === "delete") {
      // Only Project Owner OR Project Managers can delete
      if (!isProjectOwner && !isProjectManager) {
        throw new Error(
          "Access denied! Only Project Managers can delete issues."
        );
      }
      return issue;
    }

    if (action === "edit") {
      // Allowed: Owner, Manager, Member, Assignee, Reporter
      // Blocked: Viewers (unless they are the reporter/assignee?), Non-members
      const isAuthorized =
        isProjectOwner ||
        isProjectManager ||
        isProjectMember ||
        isAssignee ||
        isReporter;

      if (!isAuthorized) {
        throw new Error(
          "Access denied! You are not authorized to edit this issue."
        );
      }

      // Optional: Explicitly block 'viewers' if they are not the assignee/reporter
      if (memberRole === "viewer" && !isAssignee && !isReporter) {
        throw new Error("Viewers cannot edit issues.");
      }

      return issue;
    }
  }

  async create(issueData) {
    const { title, project, assignee, reporter, type } = issueData;

    // Validate input
    if (!title || !project || !reporter) {
      throw new Error("Title, project, and reporter are required!");
    }

    // Validate task type has assignee
    const issueType = type || "task";

    if (issueType === "task" && !assignee) {
      throw new Error("Tasks must be assigned to a member");
    }

    // Validate assignee
    if (assignee) {
      await this.validateAssigneeNotBanned(assignee);
    }

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

    if (!allParticipantIds.has(String(reporter))) {
      throw new Error("Only project managers or members can create issues.");
    }

    const reporterId = String(reporter);
    const assigneeId = String(assignee);

    const reporterIsParticipant = allParticipantIds.has(reporterId);
    if (!reporterIsParticipant) {
      throw new Error(
        "Only project managers or members can create issues for this project."
      );
    }

    const assigneeIsParticipant = allParticipantIds.has(assigneeId);

    if (assignee && !assigneeIsParticipant) {
      throw new Error("Assignee must be a project manager or team member.");
    }

    const createdIssue = await issueRepository.create(issueData);
    if (issueData.sprint) {
      try {
        await sprintRepository.addIssueToSprint(
          issueData.sprint,
          createdIssue._id
        );
      } catch (error) {
        console.log("Error linking issue to sprint:", error);
        console.error("Failed to link new issue to sprint:", error);
      }
    }

    return createdIssue;
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

  async getBacklog(projectId) {
    return await issueRepository.findBacklogIssues(projectId);
  }

  async getBoard(projectId) {
    return await issueRepository.findBoardIssues(projectId);
  }

  async updateIssue(id, updateData, user) {
    const oldIssue = await issueRepository.findById(id);

    if (!oldIssue) {
      throw new Error("Issue not found!");
    }

    if (updateData.project) delete updateData.project;
    if (updateData.key) delete updateData.key;

    if (updateData.assignee) {
      await this.validateAssigneeNotBanned(updateData.assignee);
    }

    await this.checkIssuePermission(id, user);

    const updatedIssue = await issueRepository.update(id, updateData);
    if (!updatedIssue) {
      throw new Error("Issue not found to update!");
    }

    if (updateData.sprint !== undefined) {
      const oldSprintId = oldIssue.sprint ? oldIssue.sprint.toString() : null;
      const newSprintId = updateData.sprint
        ? updateData.sprint.toString()
        : null;

      // Only act if the sprint actually changed
      if (oldSprintId !== newSprintId) {
        if (oldSprintId) {
          try {
            await sprintRepository.removeIssueFromSprint(oldSprintId, id);
          } catch (error) {
            console.error(
              `Failed to remove issue from sprint ${oldSprintId}`,
              error
            );
          }
        }

        if (newSprintId) {
          try {
            await sprintRepository.addIssueToSprint(newSprintId, id);
          } catch (error) {
            console.error(
              `Failed to add issue to sprint ${newSprintId}`,
              error
            );
          }
        }
      }
    }

    return updatedIssue;
  }

  async deleteIssue(id, user) {
    await this.checkIssuePermission(id, user);

    // Assuming repository has a delete method
    const deletedIssue = await issueRepository.delete(id);

    if (!deletedIssue) {
      throw new Error("Issue not found to delete!");
    }

    return deletedIssue;
  }
}

export const issueService = new IssueService();
