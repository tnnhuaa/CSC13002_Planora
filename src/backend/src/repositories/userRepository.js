import User from "../models/User.js";
const userRepository = {
  findAllAssignees: async () => {
    try {
      return await User.find({ role: "user" })
        .select("-hashedPassword")
        .sort({ username: 1 });
    } catch (error) {
      throw error;
    }
  },

  findAllUser: async () => {
    try {
      return await User.find().select("-hashedPassword").sort({ username: 1 });
    } catch (error) {
      throw error;
    }
  },

  findById: async (userId) => {
    try {
      return await User.findById(userId).select("-hashedPassword");
    } catch (error) {
      throw error;
    }
  },

  findByEmail: async (email) => {
    try {
      return await User.findOne({ email }).select("-hashedPassword");
    } catch (error) {
      throw error;
    }
  },

  findByUsername: async (username) => {
    try {
      return await User.findOne({ username }).select("-hashedPassword");
    } catch (error) {
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const newUser = new User(userData);
      return await newUser.save();
    } catch (error) {
      throw error;
    }
  },

  update: async (userId, updateData) => {
    try {
      return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-hashedPassword");
    } catch (error) {
      throw error;
    }
  },

  delete: async (userId) => {
    try {
      return await User.findByIdAndDelete(userId).select("-hashedPassword");
    } catch (error) {
      throw error;
    }
  },
};

export default userRepository;
