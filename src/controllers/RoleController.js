const Role = require('../models/Role')

class RoleController {
    // [GET] /roles
    async findAll(req, res, next) {
        try {
            const roles = await Role.find({}).lean()
            res.json(roles)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /roles/:id
    async findById(req, res, next) {
        try {
            const role = await Role.findById(req.params.id).lean()
            if (!role) {
                return res.status(404).json({ message: 'Role not found' })
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
            const existingRole = await Role.findOne({ name })
            if (existingRole) {
                return res
                    .status(400)
                    .json({ message: 'Role name already exists' })
            }

            // Tạo vai trò mới nếu tên vai trò chưa tồn tại
            const role = new Role({ name })
            const savedRole = await role.save()
            res.status(201).json(savedRole)
        } catch (error) {
            next(error)
        }
    }

    // [PUT] /roles/:id
    async update(req, res, next) {
        try {
            const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).lean()
            if (!role) {
                return res.status(404).json({ message: 'Role not found' })
            }
            res.json(role)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /roles/:id
    async delete(req, res, next) {
        try {
            const role = await Role.findByIdAndDelete(req.params.id).lean()
            if (!role) {
                return res.status(404).json({ message: 'Role not found' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new RoleController()
