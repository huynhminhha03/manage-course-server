const express = require('express')
const router = express.Router()
const authController = require('../../controllers/AuthController')
const { authToken } = require('../../middlewares/authToken')

// Auth
router.post('/check-email', authController.checkEmail)
router.post('/verify-email', authController.verifyEmail)
router.post('/register', authController.register)
router.post('/forgot-password', authController.forgotPassword)
router.post('/verify-otp', authController.verifyOtp)
router.post('/reset-password', authController.resetPassword)
router.post('/change-password', authToken, authController.changePassword)
router.post('/login', authController.login)

module.exports = router
