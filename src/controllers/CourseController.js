const Course = require('../models/Course')
const Lesson = require('../models/Lesson')

class CourseController {
    // [GET] /courses?is_locked=true
    async findAllByAdmin(req, res, next) {
        try {
            const filter = {}

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked === 'true'
            }

            const courses = await Course.find(filter).lean()
            res.json(courses)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/:course_id
    async findCourseByAdmin(req, res, next) {
        try {
            const course = await Course.findById(req.params.course_id).lean()
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/:course_id/lessons
    async findAllLessonsByAdmin(req, res, next) {
        try {
            // Tạo filter dựa trên query params
            const filter = { course_id: req.params.course_id }

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked === 'true'
            }

            const courseExists = await Course.findOne({
                _id: req.params.course_id,
            }).lean()
            if (!courseExists) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const lessons = await Lesson.find(filter).lean()

            if (lessons.length === 0) {
                return res
                    .status(404)
                    .json({ message: 'No lessons found for this course' })
            }

            res.json(lessons)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/:course_id/lessons/:lesson_id
    async findLessonByAdmin(req, res, next) {
        try {
            const courseExists = await Course.findOne({
                _id: req.params.course_id,
            }).lean()
            if (!courseExists) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const lesson = await Lesson.findOne({
                _id: req.params.lesson_id,
                course_id: req.params.course_id,
            }).lean()
            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }

            res.json(lesson)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/:course_id
    async getUserInCourse(req, res, next) {
        const { course_id } = req.params

        try {
            const course = await Course.findById(course_id).populate('users')
            if (!course) {
                return res.status(404).send('Course not found')
            }

            res.status(200).json(course.users)
        } catch (err) {
            res.status(500).send('Server error')
        }
    }

    // [GET] /courses
    async findAll(req, res, next) {
        try {
            const [freeCourses, proCourses] = await Promise.all([
                Course.find({
                    is_activated: true,
                    is_locked: false,
                    isFree: true,
                })
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name avatar',
                    })
                    .sort({ createdAt: -1 }),
                Course.find({
                    is_activated: true,
                    is_locked: false,
                    isFree: false,
                })
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name avatar',
                    })
                    .sort({ createdAt: -1 }),
            ])

            res.json({ freeCourses, proCourses })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/:course_id
    async findById(req, res, next) {
        try {
            const course = await Course.findOne({
                _id: req.params.course_id,
                is_activated: true,
                is_locked: false,
            }).lean()
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/:course_id/lessons
    async findLessonsByCourseId(req, res, next) {
        try {
            const courseExists = await Course.findOne({
                _id: req.params.course_id,
                is_activated: true,
                is_locked: false,
            })
                .lean()
                .sort({ createdAt: -1 })
            if (!courseExists) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const lessons = await Lesson.find({
                course_id: req.params.course_id,
                is_activated: true,
                is_locked: false,
            }).lean()

            if (lessons.length === 0) {
                return res
                    .status(404)
                    .json({ message: 'No lessons found for this course' })
            }

            res.json(lessons)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/:course_id/lessons/:lesson_id
    async findLessonByID(req, res, next) {
        try {
            const courseExists = await Course.findOne({
                _id: req.params.course_id,
                is_activated: true,
                is_locked: false,
            }).lean()
            if (!courseExists) {
                return res
                    .status(404)
                    .json({ message: 'Course not found or is not active' })
            }

            const lesson = await Lesson.findOne({
                _id: req.params.lesson_id,
                course_id: req.params.course_id,
                is_activated: true,
                is_locked: false,
            }).lean()
            if (!lesson) {
                return res
                    .status(404)
                    .json({ message: 'Lesson not found or is not active' })
            }

            res.json(lesson)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses/results
    async findByName(req, res, next) {
        try {
            const title = req.query.title || ''
            const courses = await Course.find({
                title: { $regex: title, $options: 'i' },
            }).lean()
            res.json(courses)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /courses/:course_id
    async updateByAdmin(req, res, next) {
        const { is_locked } = req.body
        const updateFields = {
            is_locked,
            locked_by: req.user.id,
        }
        try {
            const course = await Course.findByIdAndUpdate(
                req.params.course_id,
                updateFields,
                { new: true, runValidators: true }
            )
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /courses/:course_id
    async deleteByAdmin(req, res, next) {
        try {
            const course = await Course.findByIdAndDelete(
                req.params.course_id
            ).lean()

            await deleteMedia(course.image_url)

            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController()
