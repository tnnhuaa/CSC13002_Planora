import { commentRepository } from "../repositories/commentRepository.js";
import { issueRepository } from "../repositories/issueRepository.js";
import Issue from "../models/Issue.js";
import { sendMentionEmail } from "./emailService.js";
import Comment from "../models/Comment.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { projectMembersRepository } from "../repositories/projectMembersRepository.js";

class CommentService {
  // Parse @mentions from message using regex
  parseMentions(message) {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1].toLowerCase());
    }
    
    return mentions;
  }

  async createComment(issueId, userId, message) {
    try {
      // Get issue with populated fields
      const issue = await issueRepository.findById(issueId);
      if (!issue) {
        throw new Error("Issue not found");
      }

      // Create the comment
      const comment = await commentRepository.create({
        user: userId,
        message,
      });

      // Add comment to issue
      issue.comments.push(comment._id);
      await issue.save();

      // Parse mentions from message
      const mentions = this.parseMentions(message);

      // Only send emails if there are mentions
      if (mentions.length > 0) {
        const recipients = await this.getEmailRecipientsFromMentions(
          issue,
          userId,
          mentions
        );

        if (recipients.length > 0) {
          const populatedComment = await commentRepository.findAll({
            _id: comment._id,
          });
          
          const commenter = populatedComment[0].user;
          
          try {
            await sendMentionEmail(recipients, {
              commenterName: commenter.username,
              issueKey: issue.key,
              issueTitle: issue.title,
              commentMessage: message,
              projectName: issue.project?.name || issue.project?.title || 'Unknown Project',
            });
            console.log('Email sent successfully');
          } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
          }
        }
      }

      const result = await commentRepository.findAll({ _id: comment._id });
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getEmailRecipientsFromMentions(issue, commenterId, mentions) {
    try {
      const recipientSet = new Set();

      // Get project with all members
        const project = await projectRepository.findProjectById(issue.project._id);
        if (!project) {
          return [];
        }

        // Populate members
        const projectMembers = await projectMembersRepository.findMembersByProject(project);

      // Check if @all is mentioned
      if (mentions.includes('all')) {
        projectMembers.forEach((member) => {
          if (member.user && member.user._id.toString() !== commenterId.toString()) {
            recipientSet.add(member.user.email);
          }
        });
      } else {
        // Send to specific mentioned users
        mentions.forEach((mentionedUsername) => {
          const member = projectMembers.find(
            (m) => m.user && m.user.username.toLowerCase() === mentionedUsername
          );
          if (member && member.user._id.toString() !== commenterId.toString()) {
            recipientSet.add(member.user.email);
          }
        });
      }

      return Array.from(recipientSet);
    } catch (error) {
      console.error("Error getting email recipients from mentions:", error);
      return [];
    }
  }

  async getCommentsByIssue(issueId) {
    try {
      const issue = await Issue.findById(issueId);
      if (!issue) {
        throw new Error("Issue not found");
      }

      const comments = await commentRepository.findAll({
        _id: { $in: issue.comments },
      });

      await Comment.populate(comments, { 
          path: "user", 
          select: "_id username" 
      });

      return comments;
    } catch (error) {
      throw error;
    }
  }

  async updateComment(commentId, userId, message) {
    try {
      const comment = await commentRepository.findAll({ _id: commentId });
      if (!comment || comment.length === 0) {
        throw new Error("Comment not found");
      }

      // Check if user is the comment owner
      if (comment[0].user._id.toString() !== userId.toString()) {
        throw new Error("You are not authorized to update this comment");
      }

      return await commentRepository.update(commentId, { message });
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(commentId, userId) {
    try {
      const comment = await commentRepository.findAll({ _id: commentId });
      if (!comment || comment.length === 0) {
        throw new Error("Comment not found");
      }

      // Check if user is the comment owner
      if (comment[0].user._id.toString() !== userId.toString()) {
        throw new Error("You are not authorized to delete this comment");
      }

      // Remove comment from issue
      await Issue.updateOne(
        { comments: commentId },
        { $pull: { comments: commentId } }
      );

      return await commentRepository.delete(commentId);
    } catch (error) {
      throw error;
    }
  }
}

export const commentService = new CommentService();
