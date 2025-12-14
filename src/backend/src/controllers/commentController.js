import { commentService } from "../services/commentService.js";

export const createComment = async (req, res) => {
  try {
    const { issueId, message } = req.body;
    const userId = req.user._id;

    if (!issueId || !message) {
      return res.status(400).json({
        success: false,
        message: "Issue ID and message are required",
      });
    }

    let comment = await commentService.createComment(issueId, userId, message);

    if (comment.populate) {
        comment = await comment.populate('user', '_id username');
    }

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create comment",
    });
  }
};

export const getCommentsByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const comments = await commentService.getCommentsByIssue(issueId);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get comments",
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const comment = await commentService.updateComment(commentId, userId, message);

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    res.status(error.message.includes("not authorized") ? 403 : 500).json({
      success: false,
      message: error.message || "Failed to update comment",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    await commentService.deleteComment(commentId, userId);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(error.message.includes("not authorized") ? 403 : 500).json({
      success: false,
      message: error.message || "Failed to delete comment",
    });
  }
};
