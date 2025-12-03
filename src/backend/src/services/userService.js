import userRepository from "../repositories/userRepository.js";

const userService = {
  getAllAssignees: async () => {
    try {
        const assignees = await userRepository.findAllAssignees();
    
        return assignees;
    } catch (error) {
        throw error;
    }
  }
};

export default userService;