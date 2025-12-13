import { issueService } from "../services/issueService.js";
import { projectService } from "../services/projectService.js";

class IssueController {
  async create(req, res) {
    try {
      const reporterId = req.user._id;
      const { project: projectId } = req.body;

      // Only project managers can create issues for their projects
      const project = await projectService.getProjectById(
        projectId,
        reporterId
      );
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const isProjectManager =
        project.manager._id.toString() === reporterId.toString();
      if (!isProjectManager) {
        return res
          .status(403)
          .json({ message: "Only project managers can create issues" });
      }

      const issueData = {
        ...req.body,
        reporter: reporterId,
      };

      const createdIssue = await issueService.create(issueData);

      return res.status(201).json({
        message: "Create issue successfully!",
        data: createdIssue,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllIssues(req, res) {
    try {
      const filter = req.query;
      const issues = await issueService.getAllIssues(filter);

      return res.status(200).json({
        message: "Get all issues successfully!",
        data: issues,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const issue = await issueService.getIssueById(id);

      return res.status(200).json({
        message: "Get issue details successfully!",
        data: issue,
      });
    } catch (error) {
      const statusCode = error.message === "Issue not found!" ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getIssuesByProject(req, res) {
    try {
      const { projectId } = req.params;
      const { role, _id: userId } = req.user;

      const project = await projectService.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const isProjectManager =
        project.manager._id.toString() === userId.toString();
      const isProjectMember = (project.members || []).some(
        (member) => member._id.toString() === userId.toString()
      );

      console.log({ isProjectManager, isProjectMember });
      if (role === "admin") {
        const issues = await issueService.getIssuesByProject(projectId);
        return res.status(200).json({
          message: `Get issues for project successfully!`,
          data: issues,
        });
      }

      if (!isProjectManager && !isProjectMember) {
        return res
          .status(403)
          .json({ message: "You are not a member of this project" });
      }

      let issues = await issueService.getIssuesByProject(projectId);

      // Team members can only see issues assigned to them
      if (!isProjectManager) {
        issues = issues.filter(
          (issue) => issue.assignee._id.toString() === userId.toString()
        );
      }

      return res.status(200).json({
        message: `Get issues for project successfully!`,
        data: issues,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getIssuesForUser(req, res) {
    try {
      const { role, _id: userId } = req.user;

      let issues = [];
      if (role === "admin") {
        issues = await issueService.getAllIssues();
      } else {
        const managedProjects = await projectService.getProjectsManagedByUser(
          userId
        );
        const managedProjectIds = managedProjects.map((p) => p._id);

        const assignedIssues = await issueService.getIssuesByAssignee(userId);

        let managedIssues = [];
        if (managedProjectIds.length > 0) {
          managedIssues = await issueService.getIssuesByProject(
            managedProjectIds
          );
        }

        const issueMap = new Map();
        [...assignedIssues, ...managedIssues].forEach((issue) => {
          issueMap.set(issue._id.toString(), issue);
        });
        issues = Array.from(issueMap.values());
      }

      return res.status(200).json({
        message: "Get issues successfully!",
        data: issues,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUser = req.user;

      const updatedIssue = await issueService.updateIssue(
        id,
        updateData,
        currentUser
      );

      return res.status(200).json({
        message: "Update issue successfully!",
        data: updatedIssue,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  //   async deleteTask(req, res) {
  //     try {
  //       const { id } = req.params;
  //       const currentUser = req.user;

  //       await taskService.deleteTask(id, currentUser);

  //       return res.status(200).json({
  //         message: "Delete task successfully!",
  //       });
  //     } catch (error) {
  //       return res.status(400).json({ message: error.message });
  //     }
  //   }
}

export const issueController = new IssueController();
