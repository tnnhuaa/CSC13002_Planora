import Comment from "../models/Comment.js";

class CommentRepository {
    async create(commentData) {
        return await Comment.create(commentData);
    }

    async findAll(filter = {}) {
        return await Comment.find(filter)
            .populate("user");
    }

    async findByUserId(userId) {
        return await Comment.find({ user: userId })
            .populate("user");
    }

    async update(id, updateData) {
        return await Comment.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
        });
    }

    async delete(id) {
        return await Comment.findByIdAndDelete(id);
    }
}

export const commentRepository = new CommentRepository();