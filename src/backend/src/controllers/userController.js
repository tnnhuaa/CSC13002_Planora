import userService from "../services/userService.js";

class UserController {
  async getAssignees (req, res) {
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

  async authMe (req, res) {
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
        message: "Internal Server Error" 
      });
    }
  }
};

export const userController = new UserController();