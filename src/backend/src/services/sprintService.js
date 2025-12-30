import { sprintRepository } from "../repositories/sprintRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { projectMembersRepository } from "../repositories/projectMembersRepository.js";
import { issueRepository } from "../repositories/issueRepository.js";

class SprintService {
  async checkSprintPermission(projectId, userId, action = "view") {
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const isProjectManager =
      project.manager._id.toString() === userId.toString();

    const memberRole = await projectMembersRepository.getMemberRole(
      projectId,
      userId
    );

    if (action === "create" || action === "edit" || action === "delete") {
      // Only project managers can create/edit/delete sprints
      if (!isProjectManager && memberRole !== "manager") {
        throw new Error(
          "Access denied! Only project managers can perform this action."
        );
      }
    } else if (action === "view") {
      // Members and managers can view sprints
      if (!isProjectManager && !memberRole) {
        throw new Error(
          "Access denied! You are not a member of this project."
        );
      }
    }

    return true;
  }

  async createSprint(sprintData, userId) {
    const { projectId, name, goal, start_date, end_date } = sprintData;
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Validate required fields
    if (!project || !name || !start_date || !end_date) {
      throw new Error("Project, name, start date, and end date are required");
    }

    // Check permission
    await this.checkSprintPermission(projectId, userId, "create");

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }

    return await sprintRepository.create({ project: projectId, name, goal, start_date, end_date, status: "planning" });
  }

  async getAllSprints(filter = {}) {
    return await sprintRepository.findAll(filter);
  }

  async getSprintById(sprintId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "view");

    return sprint;
  }

  async getSprintsByProject(projectId, userId) {
    // Check permission
    await this.checkSprintPermission(projectId, userId, "view");

    return await sprintRepository.findByProject(projectId);
  }

  async updateSprint(sprintId, updateData, userId) {
    const { name, goal, start_date, end_date, status } = updateData;

    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "edit");

    // Validate dates if they are being updated
    if (updateData.start_date || updateData.end_date) {
      const startDate = new Date(updateData.start_date || sprint.start_date);
      const endDate = new Date(updateData.end_date || sprint.end_date);

      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }
    }

    // Prevent changing status from completed, cancelled
    if ((sprint.status === "completed" || sprint.status === "cancelled") && updateData.status !== sprint.status) {
      throw new Error("Cannot change status of a completed or cancelled sprint");
    }

    return await sprintRepository.update(sprintId, { name, goal, start_date, end_date, status });
  }

  async deleteSprint(sprintId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "delete");

    // Cannot delete active or completed sprints
    if (sprint.status === "active") {
      throw new Error(
        "Cannot delete an active sprint. Please complete or cancel it first."
      );
    }

    // Remove sprint reference from all issues
    for (const issueId of sprint.issues) {
      await issueRepository.update(issueId, { $unset: { sprint: "" } });
    }

    return await sprintRepository.delete(sprintId);
  }

  async startSprint(sprintId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "edit");

    if (sprint.status !== "planning") {
      throw new Error("Only sprints in planning status can be started");
    }

    // Check if there's already an active sprint
    const activeSprints = await sprintRepository.findActiveSprints(
      sprint.project._id
    );
    if (activeSprints.length > 0) {
      throw new Error(
        "Cannot start sprint. There is already an active sprint in this project."
      );
    }

    const originalDuration = sprint.end_date - sprint.start_date;
    const now = new Date();
    const newEndDate = new Date(now.getTime() + originalDuration);

    return await sprintRepository.update(sprintId, { status: "active", start_date: now, end_date: newEndDate });
  }

  async completeSprint(sprintId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "edit");

    if (sprint.status !== "active") {
      throw new Error("Only active sprints can be completed");
    }

    return await sprintRepository.update(sprintId, { status: "completed" });
  }

  async cancelSprint(sprintId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "edit");

    if (sprint.status !== "active" && sprint.status !== "planning") {
      throw new Error("Only active or planning sprints can be cancelled");
    }

    return await sprintRepository.update(sprintId, { status: "cancelled" });
  }

  async addIssueToSprint(sprintId, issueId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "edit");

    if (['completed', 'cancelled'].includes(sprint.status)) {
        throw new Error("Cannot add issues to a completed or cancelled sprint.");
    }

    // Verify issue exists and belongs to the same project
    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project._id.toString() !== sprint.project._id.toString()) {
      throw new Error("Issue does not belong to the same project as the sprint");
    }

    // If issue is already in the sprint, do nothing
    if (issue.sprint && issue.sprint.toString() === sprintId.toString()) {
        return sprint;
    }

    // If issue is already in another sprint, remove it first
    if (issue.sprint) {
      await sprintRepository.removeIssueFromSprint(issue.sprint, issueId);
    }

    // Update issue to reference sprint
    await issueRepository.update(issueId, { sprint: sprintId });

    return await sprintRepository.addIssueToSprint(sprintId, issueId);
  }

  async removeIssueFromSprint(sprintId, issueId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    const issue = await issueRepository.findById(issueId);
    if (!issue) {
      throw new Error("Issue not found");
    }

    if (issue.project._id.toString() !== sprint.project._id.toString()) {
      throw new Error("Issue does not belong to the same project as the sprint");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "edit");

    // Update issue to remove sprint reference
    await issueRepository.update(issueId, { $unset: { sprint: "" } });

    return await sprintRepository.removeIssueFromSprint(sprintId, issueId);
  }

  async getSprintStats(sprintId, userId) {
    const sprint = await sprintRepository.findById(sprintId);
    if (!sprint) {
      throw new Error("Sprint not found");
    }

    // Check permission
    await this.checkSprintPermission(sprint.project._id, userId, "view");

    return await sprintRepository.getSprintStats(sprintId);
  }
}

export const sprintService = new SprintService();
