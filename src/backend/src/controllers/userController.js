import userService from "../services/userService.js";

class UserController {
  async getAssignees(req, res) {
    try {
      const assignees = await userService.getAllAssignees();
      return res.status(200).json({
        success: true,
        message: "Get all assignees successfully",
        count: assignees.length,
        data: assignees,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllUser(req, res) {
    try {
      const users = await userService.getAllUser();
      return res.status(200).json({
        success: true,
        message: "Get all users successfully",
        count: users.length,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async authMe(req, res) {
    try {
      const user = req.user;

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Error occurred when calling authMe", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async banUser(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await userService.toggleBanUser(id);

      return res.status(200).json({
        success: true,
        message: `User has been ${
          updatedUser.status === "banned" ? "banned" : "unbanned"
        } successfully`,
        data: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async createUser(req, res) {
    try {
      const newUser = await userService.createUser(req.body);

      return res.status(201).json({
        message:
          "User created successfully. Default password will sent to user's email.",
        data: newUser,
      });
    } catch (error) {
      const statusCode = error.message.includes("already in use") ? 409 : 400;
      return res.status(statusCode).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await userService.updateUser(id, req.body);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export const userController = new UserController();
