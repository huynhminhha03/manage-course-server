// routes/courses.js
const express = require('express')
const router = express.Router()
const courseController = require('../../controllers/CourseController')
const { authToken } = require('../../middlewares/authToken')

router.get('/results', courseController.findByName)
router.get('/:course_id/lessons/:lesson_id',authToken, courseController.findLessonByID)
router.get('/:course_id/lessons',authToken, courseController.findLessonsByCourseId)
router.get('/:course_id', courseController.findById)
router.get('/', courseController.findAll)
router.post('/:course_id/lessons',authToken, courseController.findLessonsByCourseId)


module.exports = router
