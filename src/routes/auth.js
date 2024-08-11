const express = require('express')
const router = express.Router()
const authController = require('../controllers/AuthController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')

router.post('/login',authToken,authRole(['isAdmin', 'isStaff']), authController.login)

module.exports = router
