const Lesson = require('../models/Lesson')
const Comment = require('../models/Comment')

class LessonController {
    //Manage by Admin
    //[GET] /lessons/results
    async findByName(req, res, next) {
        try {
            const filter = { is_deleted: false }

            if (req.query.search) {
                filter.title = { $regex: req.query.search, $options: 'i' }
            }

            const lessons = await Lesson.find(filter).lean()
            console.log(lessons)
            res.json(lessons)
        } catch (error) {
            next(error)
        }
    }

    //[GET] /lessons/count-all
    async countLessons(req, res, next) {
        try {
            const filter = { is_deleted: false }
            const totalLessons = await Lesson.countDocuments(filter)

            res.json({
                total: totalLessons,
            })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /lessons
    async findAll(req, res, next) {
        try {
            const filter = { is_deleted: false }

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked
            }
            if (req.query.search) {
                filter.title = { $regex: req.query.search, $options: 'i' }
            }
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10
            const skip = (page - 1) * limit

            const [lessons, total] = await Promise.all([
                Lesson.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name slug avatar',
                    })
                    .populate({
                        path: 'course_id',
                        select: 'title',
                    })
                    .sort({ createdAt: -1 }),
                Lesson.countDocuments(filter),
            ])

            res.json({
                data: lessons,
                total: total,
                page: page,
                limit: limit,
            })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /lessons/:lesson_id
    async findById(req, res, next) {
        try {
            const filter = { is_deleted: false, _id: req.params.lesson_id }
            const lesson = await Lesson.findOne(filter).lean()
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
            const lesson = await Lesson.findByIdAndDelete(
                req.params.lesson_id
            ).lean()
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

    async countAllCommentsLesson(req, res, next) {
        try {
            const blog_id = req.params.blog_id

            const total_comments = await Comment.countDocuments({
                target_id: blog_id,
                target_type: 'Lesson',
            })

            res.json({ total_comments })
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = new LessonController()
