const Topic = require('../models/Topic')

class RoleController {
    // [GET] /roles
    async findAll(req, res, next) {
        try {
            const roles = await Topic.find({}).lean()
            res.json(roles)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /roles/:id
    async findById(req, res, next) {
        try {
            const role = await Topic.findById(req.params.id).lean()
            if (!role) {
                return res.status(404).json({ message: 'Topic not found' })
            }
            res.json(role)
        } catch (error) {
            next(error)
        }
    }

    // [POST] /roles
    async create(req, res, next) {
        try {
            const { name } = req.body

            // Kiểm tra xem tên vai trò đã tồn tại chưa
            const existingRole = await Topic.findOne({ name })
            if (existingRole) {
                return res
                    .status(400)
                    .json({ message: 'Topic name already exists' })
            }

            // Tạo vai trò mới nếu tên vai trò chưa tồn tại
            const role = new Topic({ name })
            const savedRole = await role.save()
            res.status(201).json(savedRole)
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /roles/:id
    async update(req, res, next) {
        try {
            const role = await Topic.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).lean()
            if (!role) {
                return res.status(404).json({ message: 'Topic not found' })
            }
            res.json(role)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /roles/:id
    async delete(req, res, next) {
        try {
            const role = await Topic.findByIdAndDelete(req.params.id).lean()
            if (!role) {
                return res.status(404).json({ message: 'Topic not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new RoleController()
