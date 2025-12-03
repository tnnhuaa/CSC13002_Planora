import User from "../models/User.js";
const userRepository = {
  findAllAssignees: async () => {
    try {
      return await User.find({ role: 'assignee' })
        .select('-hashedPassword')
        .sort({ username: 1 });
    } catch (error) {
      throw error;
    }
  }
};

export default userRepository;