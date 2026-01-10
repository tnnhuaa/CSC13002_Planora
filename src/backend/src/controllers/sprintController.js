import { sprintService } from "../services/sprintService.js";

class SprintController {
  async createSprint(req, res, next) {
    try {
      const userId = req.user._id || req.user.id;
      const sprint = await sprintService.createSprint(req.body, userId);

      return res.status(201).json({
        message: "Sprint created successfully!",
        data: sprint,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllSprints(req, res, next) {
    try {
      const userId = req.user._id || req.user.id;
      const filter = req.query;
      const sprints = await sprintService.getAllSprints(userId, filter);

      return res.status(200).json({
        message: "Get all sprints successfully!",
        data: sprints,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getSprintById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const sprint = await sprintService.getSprintById(id, userId);

      return res.status(200).json({
        message: "Get sprint details successfully!",
        data: sprint,
      });
    } catch (error) {
      const statusCode = error.message === "Sprint not found" ? 404 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async getSprintsByProject(req, res, next) {
    try {
      const { projectId } = req.params;
      const userId = req.user._id || req.user.id;
      const sprints = await sprintService.getSprintsByProject(
        projectId,
        userId
      );

      return res.status(200).json({
        message: "Get sprints for project successfully!",
        data: sprints,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async updateSprint(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const sprint = await sprintService.updateSprint(id, req.body, userId);

      return res.status(200).json({
        message: "Sprint updated successfully!",
        data: sprint,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async deleteSprint(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      await sprintService.deleteSprint(id, userId);

      return res.status(200).json({
        message: "Sprint deleted successfully!",
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async startSprint(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const sprint = await sprintService.startSprint(id, userId);

      return res.status(200).json({
        message: "Sprint started successfully!",
        data: sprint,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async completeSprint(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const sprint = await sprintService.completeSprint(id, userId);

      return res.status(200).json({
        message: "Sprint completed successfully!",
        data: sprint,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async addIssueToSprint(req, res, next) {
    try {
      const { id } = req.params;
      const { issueId } = req.body;
      const userId = req.user._id || req.user.id;

      if (!issueId) {
        return res.status(400).json({ message: "Issue ID is required" });
      }

      const sprint = await sprintService.addIssueToSprint(id, issueId, userId);

      return res.status(200).json({
        message: "Issue added to sprint successfully!",
        data: sprint,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async removeIssueFromSprint(req, res, next) {
    try {
      const { id } = req.params;
      const { issueId, unchangedStatus } = req.body;
      const userId = req.user._id || req.user.id;

      if (!issueId) {
        return res.status(400).json({ message: "Issue ID is required" });
      }

      const sprint = await sprintService.removeIssueFromSprint(
        id,
        issueId,
        userId,
        unchangedStatus || false
      );

      return res.status(200).json({
        message: "Issue removed from sprint successfully!",
        data: sprint,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getSprintStats(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id || req.user.id;
      const stats = await sprintService.getSprintStats(id, userId);

      return res.status(200).json({
        message: "Get sprint statistics successfully!",
        data: stats,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export const sprintController = new SprintController();
