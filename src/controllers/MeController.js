const Blog = require('../models/Blog')
const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const User = require('../models/User')
const Topic = require('../models/Topic')
const UserCourse = require('../models/UserCourse')
const { notifyUsersAboutNewLesson } = require('./NotificationController')

const Order = require('../models/Order')
const { uploadMedia, getOptimizedUrl } = require('../config/cloudinary')
const fs = require('fs')
const { formatPublicId } = require('../utils/cloudinaryUtils')
const { getVideoDuration } = require('../utils/getVideoDuration')
const WebSocket = require('ws');

// Tạo WebSocket server
const wss = new WebSocket.Server({ port: 8081 });

// Khi một client kết nối đến server
wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Received:', message);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


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
                        .json({ message: 'Tên người dùng đã được sử dụng.' })
                }
            }

            let optimizedUrl = avatar // Giữ URL avatar hiện tại nếu không có ảnh mới
            if (req.file) {
                // Chỉ upload nếu có file mới được tải lên
                const imageFilePath = req.file.path // Đường dẫn tới file ảnh/video đã lưu tạm thời
                const publicId = `avatars/${slug || name}_${Date.now()}`
                    .replace(/\s+/g, '_')
                    .toLowerCase()

                // Upload hình ảnh/video lên Cloudinary
                await uploadMedia(imageFilePath, publicId)

                // Lấy URL tối ưu hóa của hình ảnh/video
                optimizedUrl = getOptimizedUrl(publicId)
            }

            // Cập nhật thông tin người dùng
            const user = await User.findByIdAndUpdate(
                user_id,
                {
                    name,
                    slug,
                    avatar: optimizedUrl, // Cập nhật avatar nếu có
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
    async showRegisteredCoursesByUserSlug(req, res, next) {
        try {
            const user = await User.findOne({ slug: req.params.slug }).lean()
            const [paidCourses, freeCourses] = await Promise.all([
                Order.find({ user_id: user._id }).populate('course_id').lean(),
                UserCourse.find({ user_id: user._id })
                    .populate('course_id')
                    .lean(),
            ])

            const registeredCourses = [...paidCourses, ...freeCourses]

            return res.json({
                message: 'Danh sách khoá học đã đăng ký',
                courses: registeredCourses,
            })
        } catch (error) {
            next(error)
        }
    }

    async findRegisteredCourses(req, res, next) {
        try {
            const userId = req.user.id

            const [paidCourses, freeCourses] = await Promise.all([
                Order.find({ user_id: userId }).populate('course_id').lean(),
                UserCourse.find({ user_id: userId })
                    .populate('course_id')
                    .lean(),
            ])

            const registeredCourses = [...paidCourses, ...freeCourses]

            return res.json({
                message: 'Danh sách khoá học đã đăng ký',
                courses: registeredCourses,
            })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /my-courses
    async findMyCourses(req, res, next) {
        try {
            const courses = await Course.find({
                creator: req.user.id,
                is_deleted: false,
            })
                .lean()
                .sort({ createdAt: -1 })
            if (!courses) {
                return res.status(404).json({ message: 'Course not found' })
            }
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
                is_deleted: false,
            }).lean()
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            let count
            if (course.is_free) {
                count = await UserCourse.countDocuments({
                    course_id: req.params.id,
                })
            } else {
                count = await Order.countDocuments({ course_id: req.params.id })
            }
            res.json({
                course,
                count,
            })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /my-courses
    async createMyCourse(req, res, next) {
        try {
            const { title, desc, start_time, price, is_free } = req.body

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
                is_free,
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
        const { title, desc, price, is_free, start_time } = req.body

        // Khởi tạo biến để chứa URL hình ảnh/video
        let optimizedUrl

        if (req.file) {
            // Nếu có file được tải lên, tiến hành upload và lấy URL tối ưu hóa
            const imageFilePath = req.file.path // Đường dẫn tới file hình ảnh/video đã được lưu tạm thời
            const publicId = `courses/${formatPublicId(title).replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`

            // Upload hình ảnh/video lên Cloudinary
            await uploadMedia(imageFilePath, publicId)

            // Lấy URL tối ưu hóa của hình ảnh/video
            optimizedUrl = getOptimizedUrl(publicId)
        }

        // Tạo đối tượng cập nhật
        const updateFields = {
            title,
            desc,
            price,
            is_free,
            start_time,
        }

        // Chỉ thêm image_url nếu có file được tải lên
        if (optimizedUrl) {
            updateFields.image_url = optimizedUrl
        }

        try {
            const course = await Course.findOneAndUpdate(
                {
                    creator: req.user.id,
                    _id: req.params.id,
                },
                updateFields,
                {
                    new: true,
                    runValidators: true,
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
                    is_deleted: true,
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
                is_deleted: false,
            })
                .lean()
                .sort({ createdAt: -1 })

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
                is_deleted: false,
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
            const { title } = req.body
            const courseId = req.params.course_id

            const course = await Course.findById(courseId)

            const videoFilePath = req.file.path

            // Kiểm tra sự tồn tại của tệp video
            if (!fs.existsSync(videoFilePath)) {
                return res
                    .status(400)
                    .json({ message: 'Video file does not exist' })
            }

            // Đặt public ID cho video trên Cloudinary
            const publicId = `lessons/${formatPublicId(title).replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`

            // Upload video lên Cloudinary và lấy URL tối ưu hóa
            const [uploadResult, duration] = await Promise.all([
                uploadMedia(videoFilePath, publicId),
                getVideoDuration(videoFilePath),
            ])

            const optimizedUrl = getOptimizedUrl(publicId, 'video')

            // Tạo một đối tượng Lesson mới và lưu vào cơ sở dữ liệu
            const newLesson = new Lesson({
                title,
                duration,
                video_url: optimizedUrl,
                course_id: req.params.course_id,
                creator: req.user.id,
            })

            await newLesson.save()

            await notifyUsersAboutNewLesson(newLesson, course)

            // Xóa tệp video tạm sau khi lưu vào cơ sở dữ liệu
            if (fs.existsSync(videoFilePath)) {
                fs.unlinkSync(videoFilePath)
            } else {
                console.warn(
                    `File does not exist for deletion: ${videoFilePath}`
                )
            }

            res.status(201).json(newLesson)
        } catch (error) {
            console.error('Error in createLesson:', error)
            next(error)
        }
    }

    // [PATCH] /my-courses/:courseId/lessons/:lesson_id
    async updateLesson(req, res, next) {
        try {
            const { title } = req.body

            // Khởi tạo biến để chứa URL hình ảnh/video
            let optimizedUrl

            if (req.file) {
                // Nếu có file được tải lên, tiến hành upload và lấy URL tối ưu hóa
                const imageFilePath = req.file.path // Đường dẫn tới file hình ảnh/video đã được lưu tạm thời
                const publicId = `lessons/${formatPublicId(title).replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`

                // Upload hình ảnh/video lên Cloudinary
                await uploadMedia(imageFilePath, publicId)

                // Lấy URL tối ưu hóa của hình ảnh/video
                optimizedUrl = getOptimizedUrl(publicId, 'video')
            }

            const updateFields = { title }

            // Chỉ thêm image_url nếu có file được tải lên
            if (optimizedUrl) {
                updateFields.video_url = optimizedUrl
            }

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
            const lesson = await Lesson.findOneAndUpdate(
                {
                    _id: req.params.lesson_id,
                    course_id: req.params.course_id,
                    creator: req.user.id,
                },
                {
                    is_deleted: true,
                    deletedAt: new Date(),
                }
            ).lean()

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
                Blog.find({ creator: user_id, is_deleted: false })
                    .lean()
                    .populate('creator', 'name')
                    .sort({ updatedAt: -1 }),
                Blog.countDocuments({ creator: user_id, is_deleted: false }),
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
                is_deleted: false,
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
                    is_deleted: true,
                    deleted_At: new Date(),
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
    async sendNotification(req, res, next) {
        try {
            const { message } = req.body;
            console.log(message)
            if (!message) {
                return res.status(400).json({ message: 'Message is required' })
            }

            // Gửi thông báo đến tất cả client kết nối
            // Get the current date
            const dateSent = new Date().toISOString() // Format date as ISO string

            // Create the message object with date
            const notification = {
                message,
                dateSent,
            }

            // Gửi thông báo đến tất cả client kết nối
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(notification))
                }
            })

            res.status(200).json({ message: 'Notification sent' })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new MeController()
