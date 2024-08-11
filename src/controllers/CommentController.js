// controllers/CommentController.js
const Comment = require('../models/Comment')

class CommentController {
    // [GET] /comments
    async findAllComments(req, res, next) {
        try {
            const comments = await Comment.find({}).lean()

            res.json(comments)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /comments/:id
    async findCommentById(req, res, next) {
        try {
            const comments = await Comment.findById(req.params.id).lean()

            res.json(comments)
        } catch (error) {
            next(error)
        }
    }

    async createComment(req, res, next, target_id, target_type) {
        try {
            const { content, parent_id } = req.body

            // Kiểm tra nếu có parent_id thì tìm comment với id đó
            if (parent_id) {
                const parentComment = await Comment.findById(parent_id).lean()

                if (!parentComment) {
                    return res
                        .status(404)
                        .json({ message: 'Parent comment not found' })
                }
            }

            const newComment = new Comment({
                content,
                creator: req.user.id,
                parent_id: parent_id || null,
                target_id,
                target_type,
            })

            await newComment.save()

            res.status(201).json(newComment)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /comments/:id
    async updateComment(req, res, next) {
        try {
            const { content } = req.body

            
            const comment = await Comment.findOne({
                _id: req.params.id,
                creator: req.user.id,
            }).lean()

            if (!comment) {
                return res
                    .status(404)
                    .json({ message: 'Comment không tồn tại hoặc bạn không có quyền xóa comment này' })
            }

            // Cập nhật comment
            const updatedComment = await Comment.findByIdAndUpdate(
                req.params.id,
                { content },
                { new: true }
            ).lean()

            res.json(updatedComment)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /comments/:id
    async deleteComment(req, res, next) {
        try {
            const { id } = req.params
            const user_id = req.user.id

            // Tìm comment để kiểm tra quyền sở hữu của người dùng
            const comment = await Comment.findOne({
                _id: id,
                user_id,
            }).lean()

            if (!comment) {
                return res.status(404).json({
                    message:
                        'Comment không tồn tại hoặc bạn không có quyền xóa comment này',
                })
            }

            // Xóa comment chính và tất cả các comment con của nó
            const result = await Comment.deleteMany({
                $or: [{ _id: id }, { parent_id: id }],
            })

            if (result.deletedCount === 0) {
                return res
                    .status(404)
                    .json({ message: 'Không có comment nào được xóa' })
            }

            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /comments/:id/admin
    async updateCommentByAdmin(req, res, next) {
        try {
            const { id } = req.params
            const { is_activated } = req.body
            const updateFields = {
                is_activated,
                activated_by: req.user.id,
            }

            const updatedComment = await Comment.findByIdAndUpdate(
                id,
                updateFields,
                { new: true }
            ).lean()

            if (!updatedComment) {
                return res
                    .status(404)
                    .json({ message: 'Comment không tồn tại' })
            }

            res.json(updatedComment)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /comments/:id/admin
    async deleteCommentByAdmin(req, res, next) {
        try {
            const { id } = req.params

            const result = await Comment.deleteMany({
                $or: [{ _id: id }, { parent_id: id }],
            })

            if (result.deletedCount === 0) {
                return res
                    .status(404)
                    .json({ message: 'Comment không tồn tại' })
            }

            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CommentController()
