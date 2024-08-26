const express = require('express')
const router = express.Router()
const topicController = require('../controllers/TopicController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')

//Manage Role by Admin (CRUD)
router.get('/:id', authToken, authRole(['isAdmin']), topicController.findById)
router.put('/:id', authToken, authRole(['isAdmin']), topicController.update)
router.delete('/:id', authToken, authRole(['isAdmin']), topicController.delete)
router.post('/', authToken, authRole(['isAdmin']), topicController.create)
router.get('/', authToken, authRole(['isAdmin']), topicController.findAll)

module.exports = router
