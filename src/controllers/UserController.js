const User = require('../models/User')
const Blog = require('../models/Blog')
const { hashPassword } = require('../utils/authUtils') // Đảm bảo đường dẫn đúng

class UserController {
    // [GET] /users/checked-all?is_locked=true
    async findAllByAdmin(req, res, next) {
        try {
            const filter = {}

            if (req.query.is_activated !== undefined) {
                filter.is_activated = req.query.is_activated
            }

            const users = await User.find(filter).lean()
            res.json(users)
        } catch (error) {
            next(error)
        }
    }

    async getManyUsers(req, res, next) {
        try {
            const { ids } = req.body // Sử dụng req.body thay vì req.query
            if (!ids || !Array.isArray(ids)) {
                return res.status(400).json({ error: 'Invalid or missing IDs' })
            }

            const objectIds = ids.map((id) => mongoose.Types.ObjectId(id))
            const users = await User.find({ _id: { $in: objectIds } }).exec()

            res.json({
                data: users.map((user) => ({
                    ...user.toObject(),
                    id: user._id.toString(),
                })),
            })
        } catch (error) {
            console.error('Error fetching users:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }

    // [GET] /users/:slug
    async findBySlug(req, res, next) {
        try {
            const user = await User.findOne({
                slug: req.params.slug,
                is_activated: true,
            }).lean()
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
    async updateByStaff(req, res, next) {
        try {
            const { password, name, email, desc, slug, is_activated } = req.body
            const userId = req.params.id

            // Kiểm tra tính hợp lệ của các trường bắt buộc
            if (!password || !name || !email) {
                return res
                    .status(400)
                    .json({ message: 'Password, name, and email are required' })
            }

            const updateData = {
                is_activated,
                activated_by: req.user.id,
                activated_by: new Date(),
            }

            // Kiểm tra xem email có tồn tại không, ngoại trừ người dùng hiện tại
            const existingEmailUser = await User.findOne({
                email,
                _id: { $ne: userId },
            })
            if (existingEmailUser) {
                return res.status(400).json({ message: 'Email already exists' })
            }
            updateData.email = email

            // Băm mật khẩu trước khi lưu
            updateData.password = await hashPassword(password)

            // Cập nhật tên người dùng
            updateData.name = name

            // Kiểm tra và cập nhật slug nếu có
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
                updateData.slug = slug
            }

            // Cập nhật desc nếu có
            if (desc) {
                updateData.desc = desc
            }

            // Cập nhật trạng thái kích hoạt nếu có
            if (typeof is_activated === 'boolean') {
                updateData.is_activated = is_activated
            }

            // Cập nhật thông tin người dùng
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

    // [PATCH] /users/:id
    async updateByAdmin(req, res, next) {
        try {
            const { password, name, email, slug, ...userData } = req.body
            const userId = req.params.id

            // Tạo đối tượng dữ liệu cập nhật
            const updateData = { ...userData }

            // Kiểm tra xem email có tồn tại không, ngoại trừ người dùng hiện tại
            if (email) {
                const existingEmailUser = await User.findOne({
                    email,
                    _id: { $ne: userId },
                })
                if (existingEmailUser) {
                    return res
                        .status(400)
                        .json({ message: 'Email already exists' })
                }
                updateData.email = email
            }

            // Nếu mật khẩu được cập nhật, băm nó
            if (password) {
                updateData.password = await hashPassword(password)
            }

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
                updateData.slug = slug
            }

            // Cập nhật thông tin người dùng
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
