const User = require('../models/User')
const Role = require('../models/Role')
const { hashPassword, checkPassword } = require('../utils/authUtils')
const createError = require('http-errors')
const { authenticate } = require('../services/authService')
const nodemailer = require('nodemailer')
const userValidate = require('../validations/userValidation')
const otpGenerator = require('otp-generator')
require('dotenv').config()

class AuthController {
    // [POST] /change-password
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body

            const user = await User.findById(req.user.id)
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'Người dùng không tồn tại.' })
            }

            const isMatch = await checkPassword(currentPassword, user.password)
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: 'Mật khẩu hiện tại không đúng.' })
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    message: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
                })
            }

            // Kiểm tra mật khẩu mới phải từ 6 kí tự
            if (newPassword.length < 6) {
                return res
                    .status(400)
                    .json({ message: 'Mật khẩu mới phải có ít nhất 6 kí tự.' })
            }

            // Băm mật khẩu mới và cập nhật
            const hashedNewPassword = await hashPassword(newPassword)
            user.password = hashedNewPassword

            // Lưu người dùng
            await user.save()

            res.status(200).json({
                message: 'Mật khẩu đã được thay đổi thành công.',
            })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /forgot-password
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body

            // Tìm người dùng theo email
            const user = await User.findOne({ email })
            if (!user) {
                return res.status(404).json({ message: 'Email không tồn tại.' })
            }

            // Tạo OTP và thời gian hết hạn
            const otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            const expires = Date.now() + 300000 // OTP có hiệu lực trong 5 phút

            // Lưu OTP và thời gian hết hạn vào session
            req.session.otp = otp
            req.session.otpExpires = expires
            req.session.email = email

            // Gửi email với OTP
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            })

            const mailOptions = {
                to: email,
                from: process.env.EMAIL_FROM,
                subject: 'Mã OTP đặt lại mật khẩu',
                text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
            }

            await transporter.sendMail(mailOptions)

            res.status(200).json({
                message: 'Mã OTP đã được gửi đến email của bạn.',
            })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /reset-password/:token
    async resetPassword(req, res, next) {
        try {
            if (!req.session.otpVerified) {
                return res
                    .status(401)
                    .json({ message: 'Truy cập không được phép.' })
            }

            const { newPassword } = req.body

            // Giả sử email đã được lưu trong session khi xác minh OTP
            const email = req.session.email
            if (!email) {
                return res
                    .status(400)
                    .json({ message: 'Thiếu email trong session.' })
            }

            const user = await User.findOne({ email })
            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'Người dùng không tồn tại.' })
            }

            // Cập nhật mật khẩu mới
            const hashedPassword = await hashPassword(newPassword)

            user.password = hashedPassword
            await user.save()

            // Xoá OTP đã xác minh khỏi session
            req.session.otpVerified = null
            req.session.email = null

            res.status(200).json({ message: 'Đặt lại mật khẩu thành công.' })
        } catch (error) {
            next(error)
        }
    }

    // [POST] /register
    async register(req, res, next) {
        try {
            const { email, password, name, otp } = req.body
            
            console.log(req.session.otp)
            console.log(req.body)
            // Validate input data
            const { error } = userValidate(req.body)
            if (error) {
                return res.status(400).json({ message: error.details[0].message })
            }
    
            // Kiểm tra OTP có hợp lệ hay không
            if (otp !== req.session.otp || Date.now() > req.session.otpExpires) {
                return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn.' })
            }
    
            // Kiểm tra xem email đã tồn tại chưa
            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại.' })
            }
    
            // Băm mật khẩu trước khi lưu
            const hashedPassword = await hashPassword(password)
    
            // Tìm role mặc định là isUser
            const userRole = await Role.findOne({ name: 'isUser' })
            if (!userRole) {
                return res.status(500).json({ message: 'Không tìm thấy vai trò mặc định.' })
            }
    
            // Tạo người dùng mới
            const user = new User({
                email,
                name,
                password: hashedPassword,
                role_id: userRole._id, // Gán role mặc định là isUser
            })
    
            await user.save()
    
            // Xoá OTP và thông tin liên quan sau khi đăng ký thành công
            req.session.otp = null
            req.session.otpExpires = null
            req.session.email = null
    
            // Tạo token sau khi đăng ký thành công
            const { token } = await authenticate(email, password)
    
            res.status(201).json({
                message: 'Đăng ký người dùng thành công.',
                token, 
            })
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
                return res.status(401).json({ message: 'Email không hợp lệ!' })
            }

            // Kiểm tra mật khẩu
            const isMatch = await checkPassword(password, user.password)
            if (!isMatch) {
                return res
                    .status(401)
                    .json({ message: 'Email hoặc mật khẩu không hợp lệ!' })
            }

            // Sinh token (đã thực hiện trong authenticate)
            const { token } = await authenticate(email, password)
            res.json({ token })
        } catch (error) {
            next(error)
        }
    }



    // [POST] auth/check-email
    async checkEmail(req, res, next) {
        try {
            const { email } = req.body

            // Tìm người dùng theo email
            const user = await User.findOne({ email })
            if (user) {
                return res.status(400).json({ message: 'Email đã tồn tại.' })
            }

            return res.status(200).json({ message: 'Email có thể sử dụng.' })
        } catch (error) {
            next(error)
        }
    }

    // [POST] auth/verify-email
    async verifyEmail(req, res, next) {
        try {
            const { email } = req.body

            // Tìm người dùng theo email
            const user = await User.findOne({ email })
            if (user) {
                return res.status(400).json({ message: 'Email đã tồn tại.' })
            }

            console.log(req.session.otp)

            // Xóa OTP cũ nếu đã tồn tại
            if (req.session.otp) {
                console.log(req.session.otp)
                req.session.otp = null
                req.session.otpExpires = null
            }

            // Tạo OTP và thời gian hết hạn
            const otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            const expires = Date.now() + 300000 // OTP có hiệu lực trong 5 phút

            // Tạo transporter để gửi email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            })

            // Tạo email
            const mailOptions = {
                to: email,
                from: process.env.EMAIL_FROM,
                subject: 'Xác minh email của bạn',
                text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
            }

            // Gửi email
            await transporter.sendMail(mailOptions)

            req.session.otp = otp
            req.session.otpExpires = expires
            req.session.email = email

            console.log('verify-email: ', req.session)

            res.status(200).json({
                message: 'Mã OTP đã được gửi đến email của bạn.',
                otp: otp,
            })
        } catch (error) {
            next(error)
        }
    }

    // [POST] auth/verify-otp
    async verifyOtp(req, res, next) {
        try {
            const { otp } = req.body

            console.log(req.sesson)
            // Kiểm tra OTP và thời gian hết hạn
            if (
                otp !== req.session.otp ||
                Date.now() > req.session.otpExpires
            ) {
                return res.status(400).json({
                    message: 'OTP không hợp lệ hoặc đã hết hạn.',
                })
            }

            req.session.otpVerified = true

            res.status(200).json({
                message: 'OTP đã được xác minh thành công.',
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AuthController()
