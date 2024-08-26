const User = require('../models/User')
const Role = require('../models/Role')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function authenticate(email, password) {
    // Tìm người dùng theo email
    const user = await User.findOne({ email }).lean()
    console.log('User:', user)
    if (!user) {
        const error = new Error('User not found')
        error.status = 404
        throw error
    }

    // Tìm vai trò của người dùng
    const roleUser = await Role.findById(user.role_id).lean()
    console.log('Role:', roleUser)
    if (!roleUser) {
        const error = new Error('Role not found')
        error.status = 404
        throw error
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        const error = new Error('Invalid credentials')
        error.status = 401
        throw error
    }

    // Tạo token JWT với vai trò
    const token = jwt.sign(
        { id: user._id, role: roleUser.name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '100h' }
    )

    return { token }
}

module.exports = { authenticate }
