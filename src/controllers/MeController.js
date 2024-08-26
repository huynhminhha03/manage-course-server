const Blog = require('../models/Blog')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const User = require('../models/User')
const Topic = require('../models/Topic')
const {
    uploadMedia,
    getOptimizedUrl,
    deleteMedia,
} = require('../config/cloudinary')

const { formatPublicId } = require('../utils/cloudinaryUtils')

class MeController {
    // [GET] /current-user
    async getCurrentUser(req, res, next) {
        try {
            const user = await User.findById(req.user.id)
                .lean()
                .populate('role_id')
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
            const user_id = req.user.id

            // Kiểm tra slug nếu có
            if (slug) {
                const existingSlugUser = await User.findOne({
                    slug,
                    _id: { $ne: user_id },
                })
                if (existingSlugUser) {
                    return res
                        .status(400)
                        .json({ message: 'Slug already in use' })
                }
            }

            // Cập nhật thông tin người dùng
            const user = await User.findByIdAndUpdate(
                user_id,
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
            const courses = await Course.find({ creator: req.user.id })
                .lean()
                .sort({ createdAt: -1 })
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
            const { title, desc, start_time, price, isFree } = req.body

            const imageFilePath = req.file.path // Đường dẫn tới file hình ảnh/video đã được lưu tạm thời
            const publicId = `courses/${formatPublicId(title).replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`

            // Upload hình ảnh/video lên Cloudinary
            await uploadMedia(imageFilePath, publicId)

            // Lấy URL tối ưu hóa của hình ảnh/video
            const optimizedUrl = getOptimizedUrl(publicId)

            const course = new Course({
                title,
                image_url: optimizedUrl,
                desc,
                start_time,
                price,
                isFree,
                creator: req.user.id,
            })
            const savedCourse = await course.save()
            res.status(201).json(savedCourse)
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred',
                details: error.message,
            })
        }
    }

    // [PATCH] /my-courses/:id
    async updateMyCourse(req, res, next) {
        const { title, image_url, desc, price, isFree, start_time } = req.body
        const updateFields = {
            title,
            image_url,
            desc,
            price,
            isFree,
            start_time,
        }

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
            const course = await Course.findOneAndUpdate(
                {
                    creator: req.user.id,
                    _id: req.params.id,
                },
                {
                    is_activated: false,
                }
            ).lean()
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
            const user_id = req.user.id

            // Tạo các promises cho việc tìm danh sách blog và đếm số lượng blog
            const [blogs, blogCount] = await Promise.all([
                Blog.find({ creator: user_id, is_activated: true })
                    .lean()
                    .populate('creator', 'name')
                    .sort({ updatedAt: -1 }),
                Blog.countDocuments({ creator: user_id, is_activated: true }),
            ])

            // Trả về danh sách blog cùng số lượng
            res.json({
                blogs,
                blogCount,
            })
        } catch (error) {
            console.error('Error fetching blogs:', error)
            next(error)
        }
    }

    // [GET] /my-blogs/:id
    async findMyBlogById(req, res, next) {
        try {
            const blogs = await Blog.findOne({
                creator: req.user.id,
                _id: req.params.id,
                is_activated: true,
            })
                .lean()
                .populate('topic_id', 'slug')
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
            const { title, content, desc, topic_slug } = req.body

            let topic_id = null

            if (topic_slug) {
                const topic = await Topic.findOne({ slug: topic_slug })
                if (topic) {
                    topic_id = topic._id
                } else {
                    return res.status(400).json({ error: 'Topic not found' })
                }
            }

            // Tạo một đối tượng blog mới
            const blog = new Blog({
                title,
                desc,
                content,
                topic_id,
                creator: req.user.id,
            })

            // Lưu blog vào cơ sở dữ liệu
            const savedBlog = await blog.save()

            // Trả về blog đã lưu
            res.status(201).json(savedBlog)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /my-blogs/:id
    async updateMyBlog(req, res, next) {
        const { title, desc, content, topic_slug } = req.body

        let topic_id = null

        if (topic_slug) {
            const topic = await Topic.findOne({ slug: topic_slug })
            if (topic) {
                topic_id = topic._id
            } else {
                return res.status(400).json({ error: 'Topic not found' })
            }
        }

        const updateFields = { title, desc, content, topic_id }

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
            const blog = await Blog.findOneAndUpdate(
                {
                    creator: req.user.id,
                    _id: req.params.id,
                },
                {
                    is_activated: false,
                }
            ).lean()

            if (!blog) {
                return res.status(404).json({ message: 'Blog not found' })
            }

            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new MeController()
