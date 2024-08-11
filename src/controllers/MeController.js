const Blog = require('../models/Blog')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const User = require('../models/User')

class MeController {
    // [GET] /current-user
    async getCurrentUser(req, res, next) {
        try {
            const user = await User.findById(req.user.id).lean()
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            res.json(user)
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /current-user
    async updateCurrentUser(req, res, next) {
        try {
            const { name, slug, avatar, desc } = req.body
            const userId = req.user.id

            // Kiểm tra slug nếu có
            if (slug) {
                const existingSlugUser = await User.findOne({
                    slug,
                    _id: { $ne: userId },
                })
                if (existingSlugUser) {
                    return res
                        .status(400)
                        .json({ message: 'Slug already in use' })
                }
            }

            // Cập nhật thông tin người dùng
            const user = await User.findByIdAndUpdate(
                userId,
                {
                    name,
                    slug,
                    avatar,
                    desc,
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).lean()

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            res.json(user)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /registered-courses
    async findRegisteredCourses(req, res, next) {
        try {
            const user = await User.findById(req.params.id).lean()

            res.json(user.registered_courses)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /my-courses
    async findMyCourses(req, res, next) {
        try {
            const courses = await Course.find({ creator: req.user.id }).lean()
            if (!courses) {
                return res.status(404).json({ message: 'Course not found' })
            }
            console.log(courses)
            res.json(courses)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /my-courses/:id
    async findMyCourseById(req, res, next) {
        try {
            const course = await Course.findOne({
                creator: req.user.id,
                _id: req.params.id,
            }).lean()
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /my-courses
    async createMyCourse(req, res, next) {
        try {
            const { title, image_url, desc, is_activated, price } = req.body

            const course = new Course({
                title,
                image_url,
                desc,
                is_activated,
                price,
                creator: req.user.id,
            })
            const savedCourse = await course.save()
            res.status(201).json(savedCourse)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /my-courses/:id
    async updateMyCourse(req, res, next) {
        const { title, image_url, desc, price } = req.body
        const updateFields = { title, image_url, desc, price }

        try {
            const course = await Course.findOneAndUpdate(
                {
                    creator: req.user.id,
                    _id: req.params.id,
                },
                updateFields,
                {
                    new: true, // Trả về tài liệu đã được cập nhật
                    runValidators: true, // Chạy các trình xác thực
                }
            ).lean()

            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }

            res.json(course)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /my-courses/:id
    async deleteMyCourse(req, res, next) {
        try {
            const course = await Course.findOneAndDelete({
                creator: req.user.id,
                _id: req.params.id,
            }).lean()
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    // [GET] /my-courses/:course_id/lessons
    async findLessonsByCourseId(req, res, next) {
        try {
            const lessons = await Lesson.find({
                creator: req.user.id,
                course_id: req.params.course_id,
            }).lean()

            if (!lessons.length) {
                return res
                    .status(404)
                    .json({ message: 'No lessons found for this course' })
            }

            res.json(lessons)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /my-courses/:course_id/lessons/:lesson_id
    async findLessonByID(req, res, next) {
        try {
            const lesson = await Lesson.findOne({
                course_id: req.params.course_id,
                _id: req.params.lesson_id,
                creator: req.user.id,
            }).lean()

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }

            res.json(lesson)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /my-courses/:course_id/lessons
    async createLesson(req, res, next) {
        try {
            const { title, video_url, is_activated } = req.body

            // Tạo bài học mới
            const newLesson = new Lesson({
                title,
                video_url,
                is_activated,
                course_id: req.params.course_id,
                creator: req.user.id,
            })

            await newLesson.save()
            res.status(201).json(newLesson)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /my-courses/:courseId/lessons/:lesson_id
    async updateLesson(req, res, next) {
        try {
            const { title, video_url, is_activated } = req.body

            const updateFields = { title, video_url, is_activated }

            const lesson = await Lesson.findOneAndUpdate(
                {
                    _id: req.params.lesson_id,
                    course_id: req.params.course_id,
                    creator: req.user.id,
                },
                updateFields,
                { new: true, runValidators: true }
            ).lean()

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }

            res.json(lesson)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /my-courses/:courseId/lessons/:lesson_id
    async deleteLesson(req, res, next) {
        try {
            const lesson = await Lesson.findOneAndDelete({
                _id: req.params.lesson_id,
                course_id: req.params.course_id,
                creator: req.user.id,
            }).lean()

            if (!lesson) {
                return res.status(404).json({ message: 'Lesson not found' })
            }

            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    // [GET] /my-blogs
    async findMyBlogs(req, res, next) {
        try {
            const blogs = await Blog.find({ creator: req.user.id }).lean()
            if (!blogs) {
                return res.status(404).json({ message: 'Blog not found' })
            }
            console.log(blogs)
            res.json(blogs)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /my-blogs/:id
    async findMyBlogById(req, res, next) {
        try {
            const blogs = await Blog.findOne({
                creator: req.user.id,
                _id: req.params.id,
            }).lean()
            if (!blogs) {
                return res.status(404).json({ message: 'Blog not found' })
            }
            console.log(blogs)
            res.json(blogs)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /my-blogs
    async createMyBlog(req, res, next) {
        try {
            const { title, content } = req.body
            const blog = new Blog({
                title,
                content,
                creator: req.user.id,
            })
            const savedBlog = await blog.save()
            res.status(201).json(savedBlog)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /my-blogs/:id
    async updateMyBlog(req, res, next) {
        const { title, content, is_activated } = req.body
        const updateFields = { title, content, is_activated }

        try {
            const blog = await Blog.findOneAndUpdate(
                {
                    creator: req.user.id,
                    _id: req.params.id,
                },
                updateFields,
                {
                    new: true, // Trả về tài liệu đã được cập nhật
                    runValidators: true, // Chạy các trình xác thực
                }
            ).lean()

            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' })
            }

            res.json(blog)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /my-blogs/:id
    async deleteMyBlog(req, res, next) {
        try {
            const blog = await Blog.findOneAndDelete({
                creator: req.user.id,
                _id: req.params.id,
            }).lean()
            if (!blog) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new MeController()
