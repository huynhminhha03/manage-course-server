const User = require('../models/User')
const Role = require('../models/Role')
const { hashPassword, checkPassword } = require('../utils/authUtils') 
const createError = require('http-errors')
const { authenticate } = require('../services/authService')
const nodemailer = require('nodemailer')
const userValidate = require('../validations/userValidation')

class AuthController {
    // [POST] /forgot-password
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body

            // Tìm người dùng theo email
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ message: 'Email not found' })
            }

            // Sinh mã xác thực
            const token = process.env.REFRESH_ACCESS_TOKEN
            const expires = Date.now() + 3600000 // Token có hiệu lực trong 1 giờ

            // Sử dụng phương pháp setter để lưu token và expires
            user.setResetPasswordToken(token, expires)
            await user.save()

            // Gửi email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: 'hadep7a@gmail.com',
                    pass: 'xvyhjsdyzmhhoulj',
                },
            })

            const mailOptions = {
                to: user.email,
                from: '2151053013ha@ou.edu.vn',
                subject: 'Password Reset',
                text:
                    `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                    `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                    `http://${req.headers.host}/reset-password/${token}\n\n` +
                    `If you did not request this, please ignore this email and your password will remain unchanged.`,
            }

            await transporter.sendMail(mailOptions)

            res.status(200).json({
                message: 'Password reset email sent',
                token: token,
            })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /reset-password/:token
    async resetPassword(req, res, next) {
        try {
            const { token } = req.query
            const { password, confirmPassword } = req.body
            console.log(req.body)
            console.log(token)
            if (password !== confirmPassword) {
                return res
                    .status(400)
                    .json({ message: 'Passwords do not match' })
            }

            // Tìm người dùng với mã xác thực
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() },
            })

            if (!user) {
                return res.status(400).json({
                    message: 'Password reset token is invalid or has expired',
                })
            }

            // Băm mật khẩu mới và lưu
            user.password = await hashPassword(password)
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined
            await user.save()

            res.status(200).json({
                message: 'Password has been reset successfully',
            })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /register
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body

            const { error } = userValidate(req.body)
            if (error) {
                console.log(error)
                throw createError(error)
            }

            // Kiểm tra xem email đã tồn tại chưa
            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' })
            }

            // Băm mật khẩu trước khi lưu
            const hashedPassword = await hashPassword(password)

            // Tìm role mặc định là isUser
            const userRole = await Role.findOne({ name: 'isUser' })
            if (!userRole) {
                return res
                    .status(500)
                    .json({ message: 'Default role not found' })
            }

            // Tạo người dùng mới
            const user = new User({
                email,
                name,
                password: hashedPassword,
                role_id: userRole._id, // Gán role mặc định là isUser
            })

            await user.save()
            res.status(201).json({ message: 'User registered successfully' })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /login
    async login(req, res, next) {
        try {
            const { email, password } = req.body

            // Tìm người dùng theo email
            const user = await User.findOne({ email })
            if (!user) {
                return res
                    .status(401)
                    .json({ message: 'Invalid email!!!' })
            }

            // Kiểm tra mật khẩu
            const isMatch = await checkPassword(password, user.password)
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: 'Invalid email or password!!!' })
            }

            // Sinh token (đã thực hiện trong authenticate)
            const { token } = await authenticate(email, password)
            res.json({ token })
        } catch (error) {
            next(error)
        }
    }

    async loginByAdmin(req, res, next) {
        try {
            const { email, password } = req.body
            
            // Tìm người dùng theo email
            const user = await User.findOne({ email })
            if (!user) {
                return res
                    .status(401)
                    .json({ message: 'Invalid email!!!' })
            }


            // Kiểm tra mật khẩu
            const isMatch = await checkPassword(password, user.password)
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: 'Invalid email or password!!!' })
            }

            const roleUser = await Role.findById(user.role_id).lean()
            if (roleUser.name !== 'isAdmin' || roleUser.name !== 'isStaff') {
                const { token } = await authenticate(email, password)
                return res.json({ token })
            }
            res.status(401).json({ message: 'No authorize' })
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new AuthController()
