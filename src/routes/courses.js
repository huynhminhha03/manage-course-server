// routes/courses.js
const express = require('express')
const router = express.Router()
const courseController = require('../controllers/CourseController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')


router.get('/', authToken, authRole(['isAdmin', 'isStaff']), courseController.findAllByAdmin)
router.get('/:course_id', authToken, authRole(['isAdmin', 'isStaff']), courseController.findCourseByAdmin)
router.patch('/:course_id', authToken, authRole(['isAdmin', 'isStaff']), courseController.updateByAdmin)
router.delete('/:course_id', authToken, authRole(['isAdmin']), courseController.deleteByAdmin)
router.get('/:course_id/lessons',authToken, authRole(['isAdmin', 'isStaff']), courseController.findAllLessonsByAdmin)
router.get('/:course_id/lessons/:lesson_id', authRole(['isAdmin', 'isStaff']), authToken, courseController.findLessonByAdmin)
router.get('/:course_id/users', authToken,authRole(['isAdmin', 'isStaff', 'isTeacher']), courseController.getUserInCourse)



module.exports = router
