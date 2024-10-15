const User = require('../models/User')
const Blog = require('../models/Blog')
const Role = require('../models/Role')
const { hashPassword } = require('../utils/authUtils') // Đảm bảo đường dẫn đúng

class UserController {
    //[GET] /users/count-all
    async countUsers(req, res, next) {
        try {
            const filter = {}
            const totalUsers = await User.countDocuments(filter)

            res.json({
                total: totalUsers,
            })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /users
    async findAllByAdmin(req, res, next) {
        try {
            const filter = {}

            if (req.query.is_activated !== undefined) {
                filter.is_activated = req.query.is_activated === 'true'
            }

            if (req.query.role) {
                filter.role_id = req.query.role
            }

            if (req.query.search) {
                const searchValue = req.query.search
                filter.$or = [
                    { name: { $regex: searchValue, $options: 'i' } },
                    { slug: { $regex: searchValue, $options: 'i' } },
                    { email: { $regex: searchValue, $options: 'i' } },
                ]
            }

            const page = parseInt(req.query.page) || 1
            const limit = 10
            const skip = (page - 1) * limit

            const [users, total] = await Promise.all([
                User.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .populate('role_id')
                    .sort({ createdAt: -1 }),
                User.countDocuments(filter),
            ])

            res.json({
                data: users,
                total: total,
                page: page,
                limit: limit,
            })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /users/:slug
    async findBySlug(req, res, next) {
        try {
            const user = await User.findOne({
                slug: req.params.slug,
                is_activated: true,
            })
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

    // [GET] /users/checked-all/:id
    async findUserByAdmin(req, res, next) {
        try {
            const user = await User.findById(req.params.id).lean()
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            res.json(user)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /users
    async create(req, res, next) {
        try {
            const { email, password, name } = req.body

            if (!email || !password || !name) {
                return res
                    .status(400)
                    .json({ message: 'Email, password, and name are required' })
            }

            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' })
            }

            const hashedPassword = await hashPassword(password)

            const user = new User({
                email,
                name,
                password: hashedPassword,
            })

            await user.save()

            // Trả về thông tin người dùng đã tạo
            res.status(201).json(user)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /users/:id
    async updateByAdmin(req, res, next) {
        try {
            const { is_activated, role_id } = req.body
            const userId = req.params.id

            let updateData = { is_activated }

            if (req.user.role === 'isAdmin' && role_id) {
                const role = await Role.findById(role_id).lean()
                if (!role) {
                    return res.status(400).json({ Error: 'Role not found' })
                }
                updateData.role_id = role_id
            }

            const user = await User.findByIdAndUpdate(userId, updateData, {
                new: true,
                runValidators: true,
            }).lean()

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            res.json(user)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /users
    async delete(req, res, next) {
        try {
            const user = await User.findByIdAndDelete(req.params.id).lean()
            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    //[GET] /users/:id/blogs
    async findAllUserBlogsByAdmin(req, res, next) {
        try {
            const { id } = req.params
            const { is_activated } = req.query

            const filter = { creator: id }

            if (is_activated !== undefined) {
                filter.is_activated = is_activated === 'true'
            }

            const blogs = await Blog.find(filter).lean()

            res.json(blogs)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController()
