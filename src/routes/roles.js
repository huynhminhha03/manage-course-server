const express = require('express')
const router = express.Router()
const roleController = require('../controllers/RoleController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')

//Manage Role by Admin (CRUD)
router.get('/:id', authToken, authRole(['isAdmin']), roleController.findById)
router.put('/:id', authToken, authRole(['isAdmin']), roleController.update)
router.delete('/:id', authToken, authRole(['isAdmin']), roleController.delete)
router.post('/', authToken, authRole(['isAdmin']), roleController.create)
router.get('/', authToken, authRole(['isAdmin']), roleController.findAll)

module.exports = router
