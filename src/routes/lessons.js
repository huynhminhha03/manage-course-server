// routes/lessons.js
const express = require('express')
const router = express.Router()
const lessonController = require('../controllers/LessonController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')


router.get('/count-all', authToken, authRole(['isAdmin', 'isStaff']), lessonController.countLessons)
router.get('/results', authToken, authRole(['isAdmin', 'isStaff']), lessonController.findByName)

router.get('/', authToken, authRole(['isAdmin', 'isStaff']), lessonController.findAll)
router.get('/:lesson_id', authToken, authRole(['isAdmin', 'isStaff']), lessonController.findById)
router.patch('/:lesson_id', authToken, authRole(['isAdmin', 'isStaff']), lessonController.update) // Update a lesson by ID
router.delete('/:lesson_id', authToken, authRole(['isAdmin']), lessonController.delete) // Delete a lesson by ID



module.exports = router
