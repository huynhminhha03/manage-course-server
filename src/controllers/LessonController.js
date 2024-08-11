const Lesson = require('../models/Lesson')
const Comment = require('../models/Comment')

const {
    createComment,
    
} = require('../services/commentService')

class LessonController {

    //Manage by Admin
    // [GET] /lessons
    async findAll(req, res, next) {
        try {
            const filter = {}

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked
            }

            const lessons = await Lesson.find(filter).lean()
            res.json(lessons)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /lessons/:lesson_id
    async findById(req, res, next) {
        try {
            const lesson = await Lesson.findById(req.params.lesson_id).lean()
            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }
            res.json(lesson)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /lessons/:lesson_id
    async update(req, res, next) {
        const { is_locked } = req.body
        const updateFields = {
            is_locked,
            locked_by: req.user.id,
        }
        try {
            const lesson = await Lesson.findByIdAndUpdate(
                req.params.lesson_id,
                updateFields,
                { new: true, runValidators: true }
            )
            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }
            res.json(lesson)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /lessons/:lesson_id
    async delete(req, res, next) {
        try {
            const lesson = await Lesson.findByIdAndDelete(req.params.lesson_id).lean()
            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    //[GET] /lessons/:lesson_id/comments
    async getCommentsForLesson(req, res, next) {
        try {
            const { lesson_id } = req.params

            // Lấy tất cả comment gốc (parent_id là null) cho lesson cụ thể
            const parentComments = await Comment.find({
                target_id: lesson_id,
                target_type: 'Lesson',
                parent_id: null,
            }).lean()

            res.json(parentComments)
        } catch (error) {
            next(error)
        }
    }

    //[GET] /lessons/:lesson_id/comments/parent_id/replies
    async getRepliesForComment(req, res, next) {
        try {
            const { lesson_id, parent_id } = req.params

            // Lấy tất cả comment con của một comment gốc cụ thể
            const replies = await Comment.find({
                target_id: lesson_id,
                target_type: 'Lesson',
                parent_id,
            }).lean()

            res.json(replies)
        } catch (error) {
            next(error)
        }
    }

    // POST /lessons/:lesson_id/comments/
    async createCommentForLesson(req, res, next) {
        const { lesson_id, parent_id } = req.params
        await createComment(req, res, next, lesson_id, parent_id, 'Lesson')
    }
}

module.exports = new LessonController()
