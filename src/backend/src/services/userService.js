import { get } from "mongoose";
import userRepository from "../repositories/userRepository.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import {
  sendAccountCreatedEmail,
  sendAccountUpdatedEmail,
  sendAccountDeletedEmail,
  sendAccountStatusChangedEmail,
} from "./emailService.js";

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

      sendAccountStatusChangedEmail(
        user.email,
        user.fullName || user.username,
        newStatus
      );
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

      const newUserPayload = {
        fullName: fullName || finalUsername,
        username: finalUsername,
        email,
        role: role || "user",
        hashedPassword: hashedPasswordHash,
        status: "active",
      };

      const newUser = await userRepository.create(newUserPayload);

      sendAccountCreatedEmail(
        newUser.email,
        newUser.fullName || newUser.username,
        fixedPassword,
        newUser.role
      );

      return newUser;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (userId, updateData) => {
    try {
      const currentUser = await userRepository.findById(userId);
      if (!currentUser) throw new Error("User not found");

      if (updateData.email && updateData.email !== currentUser.email) {
        const existingUser = await userRepository.findByEmail(updateData.email);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new Error("This email is already in use by another user.");
        }
      }

      if (updateData.username && updateData.username !== currentUser.username) {
        const existingUser = await userRepository.findByUsername(
          updateData.username
        );
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new Error("This username is already taken.");
        }
      }

      const updatedUser = await userRepository.update(userId, updateData);

      // FIX 1: Now 'currentUser' exists, so this logic works
      const changes = [];

      // Check Email Change
      if (updateData.email && updateData.email !== currentUser.email) {
        changes.push(
          `Email changed from ${currentUser.email} to ${updateData.email}`
        );
      }

      // Check Role Change
      if (updateData.role && updateData.role !== currentUser.role) {
        changes.push(
          `Role changed from ${currentUser.role} to ${updateData.role}`
        );
      }

      // SEND EMAIL only if there are changes
      if (changes.length > 0) {
        sendAccountUpdatedEmail(
          updateData.email || currentUser.email,
          updateData.fullName || currentUser.fullName || currentUser.username,
          changes
        );
      }

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

      await userRepository.delete(id);

      // Send email after successful deletion
      sendAccountDeletedEmail(user.email, user.fullName || user.username);

      return true;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
