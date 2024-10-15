const Course = require('../models/Course')
const Lesson = require('../models/Lesson')
const Order = require('../models/Order')
const UserCourse = require('../models/UserCourse')

class CourseController {

    //[GET] /courses/count-all
    async countCourses(req, res, next) {
        try {
            const filter = { is_deleted: false }
            const totalCourses = await Course.countDocuments(filter)

            res.json({
                total: totalCourses,
            })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /courses?is_locked=true
    async findAllByAdmin(req, res, next) {
        try {
            const filter = {is_deleted: false}

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked === 'true'
            }

            if (req.query.search) {
                filter.title = { $regex: req.query.search, $options: 'i' } 
            }
            
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10
            const skip = (page - 1) * limit

            const [courses, total] = await Promise.all([
                Course.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name slug',
                    })
                    .sort({ createdAt: -1 }),
                Course.countDocuments(filter),
            ])

            res.json({
                data: courses,
                total: total,
                page: page,
                limit: limit,
            })
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
                    is_deleted: false,
                    is_locked: false,
                    is_free: true,
                })
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name avatar',
                    })
                    .sort({ createdAt: -1 }),
                Course.find({
                    is_deleted: false,
                    is_locked: false,
                    is_free: false,
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
                is_deleted: false,
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
                is_deleted: false,

                is_locked: false,
            })
                .lean()
                .sort({ createdAt: -1 })
            if (!courseExists) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const lessons = await Lesson.find({
                course_id: req.params.course_id,
                is_deleted: false,
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

    async quickViewLessons(req, res, next) {
        try {
            const courseExists = await Course.findOne({
                _id: req.params.course_id,
                is_deleted: false,
                is_locked: false,
            })
                .lean()
                .sort({ createdAt: -1 })

            if (!courseExists) {
                return res.status(404).json({ message: 'Course not found' })
            }

            const lessons = await Lesson.find({
                course_id: req.params.course_id,
                is_deleted: false,
                is_locked: false,
            })
                .select('title _id duration')
                .lean()

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
                is_deleted: false,
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
                is_deleted: false,
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

            let filter = {
                title: { $regex: title, $options: 'i' },
                is_deleted: false,
                is_locked: false,
            }

            const courses = await Course.find(filter).lean()
            res.json(courses)
        } catch (error) {
            next(error)
        }
    }

    async findNameCourseByAdmin(req, res, next) {
        try {
            const title = req.query.title || ''
            
            let filter = {
                title: { $regex: title, $options: 'i' },
                is_deleted: false,
            }

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked
            }
            console.log(req.query.is_locked)
            console.log(filter);
            const courses = await Course.find(filter).lean()
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

            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    async registerCourse(req, res, next) {
        try {
            const course_id = req.params.course_id
            const course = await Course.findById(course_id)
            if (!course) {
                return res.status(404).json({ message: 'Course not found' })
            }

            if (course.is_free) {
                const registerCourse = new UserCourse({
                    user_id: req.user.id,
                    course_id,
                })

                await registerCourse.save()
                res.status(201).json({ registerCourse })
            } else {
                res.status(403).json({
                    error: 'chỉ dành cho khoá học miễn phí',
                })
            }
        } catch (error) {
            next(error)
        }
    }

    async checkRegisterCourse(req, res, next) {
        try {
            const { course_id } = req.params
            const user_id = req.user.id
            const course = await Course.findById(course_id)
            if (course.is_free) {
                const hasRegistered = await UserCourse.findOne({
                    course_id,
                    user_id,
                })

                if (hasRegistered) {
                    return res.status(200).json({
                        message: 'User has already registered for this course.',
                        registered: true,
                    })
                }
            } else {
                const hasRegistered = await Order.findOne({
                    course_id,
                    user_id,
                })

                if (hasRegistered) {
                    return res.status(200).json({
                        message: 'User has already registered for this course.',
                        registered: true,
                    })
                }
            }

            return res.status(200).json({
                message: 'User has not registered for this course.',
                registered: false,
            })
        } catch (error) {
            next(error)
        }
    }


    async getStatisticsForYear(req, res, next) {
        const year = parseInt(req.params.year);

        try {
            const [coursesRegistered, paidOrders] = await Promise.all([
                // Thống kê số khóa học đăng ký trong năm
                UserCourse.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(`${year}-01-01`),
                                $lt: new Date(`${year + 1}-01-01`)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                month: { $month: '$createdAt' },
                                year: { $year: '$createdAt' }
                            },
                            count: { $sum: 1 } // Đếm số khóa học đăng ký
                        }
                    },
                    {
                        $sort: { '_id.month': 1 } // Sắp xếp theo tháng
                    }
                ]),

                // Thống kê số đơn hàng đã thanh toán trong năm
                Order.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(`${year}-01-01`),
                                $lt: new Date(`${year + 1}-01-01`)
                            },
                            transaction_status: '00' // Chỉ lọc các đơn hàng đã thanh toán
                        }
                    },
                    {
                        $group: {
                            _id: {
                                month: { $month: '$createdAt' },
                                year: { $year: '$createdAt' }
                            },
                            totalAmount: { $sum: '$amount' }, // Tổng số tiền đã thanh toán
                            count: { $sum: 1 } // Đếm số đơn hàng
                        }
                    },
                    {
                        $sort: { '_id.month': 1 } // Sắp xếp theo tháng
                    }
                ])
            ]);

            // Trả về kết quả
            res.status(200).json({
                success: true,
                data: {
                    coursesRegistered,
                    paidOrders,
                }
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics',
                error: error.message
            });
        }
    }
}

module.exports = new CourseController()
