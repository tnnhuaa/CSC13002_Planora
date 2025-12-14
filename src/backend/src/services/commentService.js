import { commentRepository } from "../repositories/commentRepository.js";
import { issueRepository } from "../repositories/issueRepository.js";
import Issue from "../models/Issue.js";
import { sendCommentNotificationEmail } from "./emailService.js";
import Comment from "../models/Comment.js";

class CommentService {
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

      // Determine email recipients
      const recipients = await this.getEmailRecipients(issue, userId);

      // Send email notifications if there are recipients
      if (recipients.length > 0) {
        const populatedComment = await commentRepository.findAll({
          _id: comment._id,
        });
        
        const commenter = populatedComment[0].user;
        
        console.log('Sending email to:', recipients);
        console.log('Comment data:', {
          commenterName: commenter.username,
          issueKey: issue.key,
          issueTitle: issue.title,
          projectName: issue.project?.name || issue.project?.title || 'Unknown Project',
        });
        
        try {
          await sendCommentNotificationEmail(recipients, {
            commenterName: commenter.username,
            issueKey: issue.key,
            issueTitle: issue.title,
            commentMessage: message,
            projectName: issue.project?.name || issue.project?.title || 'Unknown Project',
          });
          console.log('Email sent successfully');
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't throw error, just log it so comment creation still succeeds
        }
      } else {
        console.log('No recipients to send email to');
      }

      const result = await commentRepository.findAll({ _id: comment._id });
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  async getEmailRecipients(issue, commenterId) {
    try {
      const recipientSet = new Set();

      console.log('Getting email recipients for issue:', issue.key);
      console.log('Commenter ID:', commenterId);
      console.log('Assignee:', issue.assignee?.email);
      console.log('Reporter:', issue.reporter?.email);

      // Get all previous commenters
      if (issue.comments && issue.comments.length > 0) {
        const existingComments = await commentRepository.findAll({
          _id: { $in: issue.comments },
        });

        existingComments.forEach((comment) => {
          if (comment.user && comment.user._id.toString() !== commenterId.toString()) {
            recipientSet.add(comment.user.email);
          }
        });
      }

      // Add assignee email if they're not the commenter
      if (issue.assignee && issue.assignee._id.toString() !== commenterId.toString()) {
        recipientSet.add(issue.assignee.email);
      }

      // Add reporter email if they're not the commenter
      if (issue.reporter && issue.reporter._id.toString() !== commenterId.toString()) {
        recipientSet.add(issue.reporter.email);
      }

      return Array.from(recipientSet);
    } catch (error) {
      console.error("Error getting email recipients:", error);
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
