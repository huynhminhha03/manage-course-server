// commentService.js
const Comment = require('../models/Comment')

async function createComment(req, res, next, target_id, target_type) {
    try {
        const { content, parent_id } = req.body;

        // Kiểm tra nếu có parent_id thì tìm comment với id đó
        if (parent_id) {
            const parentComment = await Comment.findById(parent_id).lean();

            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
        }

        const newComment = new Comment({
            content,
            user_id: req.user.id,
            parent_id: parent_id || null,
            target_id,
            target_type,
        });

        await newComment.save();

        res.status(201).json(newComment);
    } catch (error) {
        next(error);
    }
}


async function updateComment(req, res, next) {
    try {
        const { comment_id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Tìm comment theo ID và trả về đối tượng JavaScript đơn giản
        const comment = await Comment.findById(comment_id).lean();
        console.log(comment)
        if (!comment) {
            return res.status(404).json({ message: 'Comment không tồn tại' });
        }

        // Kiểm tra người dùng có phải là chủ sở hữu của comment không
        if (comment.user_id.toString() !== userId) {
            return res.status(403).json({ message: 'Không có quyền chỉnh sửa comment này' });
        }

        // Cập nhật comment
        const updatedComment = await Comment.findByIdAndUpdate(
            comment_id,
            { content, updatedAt: new Date() },
            { new: true }
        ).lean();

        res.json(updatedComment);
    } catch (error) {
        next(error);
    }
}


async function deleteComment(req, res, next) {
    try {
        const { comment_id } = req.params

        const result = await Comment.deleteMany({
            $or: [{ _id: comment_id }, { parent_id: comment_id }],
        })

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Comment không tồn tại' })
        }

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createComment,
    updateComment,
    deleteComment,
}
