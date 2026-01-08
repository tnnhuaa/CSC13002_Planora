import { projectRepository } from "../repositories/projectRepository.js";
import { projectMembersRepository } from "../repositories/projectMembersRepository.js";
import { issueRepository } from "../repositories/issueRepository.js";
import { sprintRepository } from "../repositories/sprintRepository.js";
import mongoose from "mongoose";
import userRepository from "../repositories/userRepository.js";
import { favoriteProjectRepository } from "../repositories/favoriteProjectRepository.js";

class ProjectService {
  async createProject(data, managerId) {
    try {
      const { members, ...restData } = data;
      const projectData = { ...restData, manager: managerId };

      const project = await projectRepository.createProject(projectData);
      console.log("✅ (1) Created Project:", project._id);

      await projectMembersRepository.addMember(
        project._id,
        managerId,
        "manager"
      );
      console.log("✅ (2) Added Manager:", managerId);

      if (members && Array.isArray(members) && members.length > 0) {
        const managerIdStr = String(managerId);

        await Promise.all(
          members.map(async (member) => {
            const memberIdStr = String(member.userId);

            if (memberIdStr === managerIdStr) {
              return;
            }

            try {
              await projectMembersRepository.addMember(
                project._id,
                member.userId,
                member.role || "member"
              );
              console.log("   -> Added Member:", member.userId);
            } catch (innerError) {
              if (
                innerError.message &&
                innerError.message.includes("already")
              ) {
                console.warn(
                  `   ⚠️ Skipped duplicate member: ${member.userId}`
                );
              } else {
                throw innerError;
              }
            }
          })
        );
      }

      return project;
    } catch (error) {
      console.error("❌ Transaction Failed:", error.message);
      await session.abortTransaction();
      throw error;
    }
  }

  async addMemberToProject(projectId, userId, role, requesterId) {
    // Check if requester is a manager of the project
    const requesterRole = await projectMembersRepository.getMemberRole(
      projectId,
      requesterId
    );
    if (requesterRole !== "manager") {
      throw new Error("Only managers can add members to the project");
    }

    // Validate role
    const validRoles = ["manager", "member", "viewer"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role specified");
    }

    const userToAdd = await userRepository.findById(userId);
    if (!userToAdd) {
      throw new Error("User not found");
    }
    // Check strict backend status "banned"
    if (userToAdd.status === "banned") {
      throw new Error("This user is banned and cannot be added to projects.");
    }

    // Validate if member already exists
    const exists = await projectMembersRepository.existsMember(
      projectId,
      userId
    );
    if (exists) {
      throw new Error("User is already a member of the project");
    }

    return await projectMembersRepository.addMember(projectId, userId, role);
  }

  async removeMemberFromProject(projectId, userId, requesterId) {
    // Check if requester is a manager of the project
    const requesterRole = await projectMembersRepository.getMemberRole(
      projectId,
      requesterId
    );
    if (requesterRole !== "manager") {
      throw new Error("Only managers can remove members from the project");
    }

    // Validate if member exists
    const exists = await projectMembersRepository.existsMember(
      projectId,
      userId
    );
    if (!exists) {
      throw new Error("User is not a member of the project");
    }

    // Prevent removing the last manager
    const memberRole = await projectMembersRepository.getMemberRole(
      projectId,
      userId
    );

    if (memberRole === "manager") {
      const managerCount =
        await projectMembersRepository.countMembersByRole(projectId, "manager");
      if (managerCount <= 1) {
        throw new Error(
          "Cannot remove the last manager of the project. Please assign another manager first."
        );
      }
    };

    // Validate deleted user is the deleter
    if (userId === requesterId) {
      throw new Error("Managers cannot remove themselves from the project.");
    };

    // All issues of the user go to backlog (unassigned)
    const issues = await issueRepository.findByAssigneeIdAndProjects(
      userId,
      [projectId]
    );
    await Promise.all(
      issues.map(async (issue) =>
        issueRepository.updateIssue(issue._id, { assignee: null, sprint: null, status: "backlog" })
      )
    );
    
    // Delete favaorite projects of the user related to this project
    const favoriteProjects = await favoriteProjectRepository.findByUser(userId);
    await Promise.all(
      favoriteProjects
        .filter((fav) => String(fav.project._id) === String(projectId))
        .map(async (fav) =>
          favoriteProjectRepository.delete(userId, projectId)
        )
    );

    return await projectMembersRepository.removeMember(projectId, userId);
  }

  async changeMemberRole(projectId, userId, newRole, requesterId) {
    // Check if requester is a manager of the project
    const requesterRole = await projectMembersRepository.getMemberRole(
      projectId,
      requesterId
    );
    if (requesterRole !== "manager") {
      throw new Error("Only managers can change member roles");
    }

    // Validate role
    const validRoles = ["manager", "member", "viewer"];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role specified");
    }

    // Validate if member exists
    const exists = await projectMembersRepository.existsMember(
      projectId,
      userId
    );
    if (!exists) {
      throw new Error("User is not a member of the project");
    };

    // Prevent demoting the last manager
    const currentRole = await projectMembersRepository.getMemberRole(
      projectId,
      userId
    );
    
    if (currentRole === "manager" && newRole !== "manager") {
      const managerCount =
        await projectMembersRepository.countMembersByRole(projectId, "manager");
      if (managerCount <= 1) {
        throw new Error(
          "Cannot demote the last manager of the project. Please assign another manager first."
        );
      }
    }

    return await projectMembersRepository.updateMemberRole(
      projectId,
      userId,
      newRole
    );
  }

  async getProjectDetails(userId, projectId) {
    const project = await projectRepository.findProjectById(projectId);

    if (!project) {
      throw new Error("Project not found");
    }

    // Check user is a member of the project
    const isMember = await projectMembersRepository.existsMember(
      projectId,
      userId
    );

    if (!isMember) {
      throw new Error("User is not a member of the project");
    }

    // Fetch members
    const members = await projectMembersRepository.findMembersByProject(
      projectId
    );

    const issues = await issueRepository.findByProjects(projectId);

    // Progress (done/total)
    const doneCount = issues.filter((issue) => issue.status === "done").length;
    const totalCount = issues.length;
    const progress = totalCount === 0 ? 0 : (doneCount / totalCount) * 100;

    return { ...project.toObject(), members, issues, progress };
  }

  async getProjectMembers(projectId, userId) {
    // Check if user is a member of the project
    const isMember = await projectMembersRepository.existsMember(
      projectId,
      userId
    );
    if (!isMember) {
      throw new Error("You are not a member of this project");
    }

    const members = await projectMembersRepository.findMembersByProject(
      projectId
    );

    // MAP data to include 'status' so Frontend can filter
    // We assume member.user is populated (based on your repository code)
    return members.map((member) => ({
      ...member.toObject(),
      // Ensure we explicitly pass the user status to the frontend
      // status comes from the populated 'user' object
      status: member.user?.status || "active",
      isBanned: member.user?.status === "banned",
    }));
  }

  async getProjectById(projectId, userId) {
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user is a member of the project
    const isMember = await projectMembersRepository.existsMember(
      projectId,
      userId
    );
    if (!isMember) {
      throw new Error("You are not a member of this project");
    }

    return project;
  }

  async getUserProjects(userId) {
    const projectMembers = await projectMembersRepository.findProjectsByUser(
      userId
    );

    const result = await Promise.all(
      projectMembers.map(async (pm) => {
        if (!pm.project) {
          return null;
        }
        const project = await projectRepository.findProjectById(pm.project._id);
        // Fetch members for each project
        const members = await projectMembersRepository.findMembersByProject(
          pm.project._id
        );
        if (!project) return null;

        // Progress (done/total)
        const issues = await issueRepository.findByProjects(project._id);
        const doneCount = issues.filter(
          (issue) => issue.status === "done"
        ).length;
        const totalCount = issues.length;
        const progress = totalCount === 0 ? 0 : (doneCount / totalCount) * 100;

        return { ...project.toObject(), members, progress };
      })
    );

    return result.filter((item) => item !== null);
  }

  async getProjectsManagedByUser(userId) {
    const projectMembers = await projectMembersRepository.findProjectsByUser(
      userId
    );

    const managedProjects = projectMembers
      .filter((pm) => pm.role === "manager" && pm.project)
      .map((pm) => pm.project);

    return managedProjects;
  }

  async updateProject(userId, projectId, data) {
    // Check if project exists
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user is a manager of the project
    const userRole = await projectMembersRepository.getMemberRole(
      projectId,
      userId
    );

    if (userRole !== "manager") {
      throw new Error("Only managers can update the project");
    }

    return await projectRepository.updateProject(projectId, data);
  }

  async deleteProject(userId, projectId) {
    // Check if project exists
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user is a manager of the project
    const userRole = await projectMembersRepository.getMemberRole(
      projectId,
      userId
    );

    if (userRole !== "manager") {
      throw new Error("Only managers can delete the project");
    }

    // Remove all project members
    const members = await projectMembersRepository.findMembersByProject(
      projectId
    );
    await Promise.all(
      members
        .filter((member) => member.user)
        .map(async (member) => {
          await projectMembersRepository.removeMember(projectId, member.user._id);
        })
    );

    // Remove all issues related to the project
    const issues = await issueRepository.findByProjects(projectId);
    await Promise.all(
      issues.map(async (issue) => await issueRepository.delete(issue._id))
    );

    // Remove all sprints related to the project
    const sprints = await sprintRepository.findByProject(projectId);
    await Promise.all(
      sprints.map(async (sprint) => await sprintRepository.delete(sprint._id))
    );

    // Remove favorite projects related to this project
    const favoriteProjects = await favoriteProjectRepository.findByProject(projectId);
    await Promise.all(
      favoriteProjects.map(async (fav) =>
        favoriteProjectRepository.delete(fav.user, projectId)
      )
    );

    return projectRepository.deleteProject(projectId);
  }
}

export const projectService = new ProjectService();
