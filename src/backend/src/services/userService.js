import { get } from "mongoose";
import userRepository from "../repositories/userRepository.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const userService = {
  getAllAssignees: async () => {
    try {
      const assignees = await userRepository.findAllAssignees();

      return assignees;
    } catch (error) {
      throw error;
    }
  },

  getAllUser: async () => {
    try {
      const users = await userRepository.findAllUser();

      return users;
    } catch (error) {
      throw error;
    }
  },

  toggleBanUser: async (userId) => {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const newStatus = user.status === "active" ? "banned" : "active";

      return await userRepository.update(userId, { status: newStatus });
    } catch (error) {
      throw error;
    }
  },

  createUser: async ({ fullName, username, email, role }) => {
    try {
      const finalUsername = username || email.split("@")[0].toLowerCase();

      const existingEmail = await userRepository.findByEmail(email);
      if (existingEmail) {
        throw new Error("Email is already in use.");
      }

      const existingUser = await userRepository.findByUsername(finalUsername);
      if (existingUser) {
        throw new Error("Username is already taken.");
      }

      const fixedPassword = "Planora@123456";

      const salt = await bcrypt.genSalt(10);
      const hashedPasswordHash = await bcrypt.hash(fixedPassword, salt);

      const newUser = new User({
        fullName,
        username,
        email,
        role: role || "user",
        hashedPassword: hashedPasswordHash,
        status: "active",
      });

      return await userRepository.create(newUser);
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (userId, updateData) => {
    try {
      if (updateData.email) {
        const existingUser = await userRepository.findByEmail(updateData.email);

        if (existingUser && existingUser._id.toString() !== userId) {
          throw new Error("This email is already in use by another user.");
        }
      }

      if (updateData.username) {
        const existingUser = await userRepository.findByUsername(
          updateData.username
        );

        if (existingUser && existingUser._id.toString() !== userId) {
          throw new Error("This username is already taken.");
        }
      }
      const updatedUser = await userRepository.update(userId, updateData);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const user = await userRepository.findById(id);
      if (!user) throw new Error("User not found");

      if (user.role === "admin" && user.email === "admin@planora.com") {
        throw new Error("Cannot delete the main Admin account.");
      }

      return await userRepository.delete(id);
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
