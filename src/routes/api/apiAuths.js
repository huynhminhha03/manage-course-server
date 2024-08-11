const express = require('express')
const router = express.Router()
const authController = require('../../controllers/AuthController')

// Auth
router.post('/register', authController.register)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)
router.post('/login', authController.login)

module.exports = router
