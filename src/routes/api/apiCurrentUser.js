const express = require('express')
const router = express.Router()
const meController = require('../../controllers/MeController')
const { authToken } = require('../../middlewares/authToken')
const { authRole } = require('../../middlewares/authRole')


//Get, Patch Current User
router.get('/current-user', authToken, meController.getCurrentUser);
router.patch('/current-user', authToken, meController.updateCurrentUser);
router.get('/registered-courses', authToken, meController.findRegisteredCourses);

//Manage created Courses by Teacher
router.get('/my-courses', authToken, authRole(['isTeacher']), meController.findMyCourses);
router.get('/my-courses/:id', authToken, authRole(['isTeacher']), meController.findMyCourseById);
router.post('/my-courses', authToken, authRole(['isTeacher']), meController.createMyCourse);
router.patch('/my-courses/:id', authToken, authRole(['isTeacher']), meController.updateMyCourse);
router.delete('/my-courses/:id', authToken, authRole(['isTeacher']), meController.deleteMyCourse);

//Manage Lesson in Created Course by Teacher
router.get('/my-courses/:course_id/lessons', authToken, authRole(['isTeacher']), meController.findLessonsByCourseId);
router.get('/my-courses/:course_id/lessons/:lesson_id', authToken, authRole(['isTeacher']), meController.findLessonByID);
router.post('/my-courses/:course_id/lessons', authToken, authRole(['isTeacher']), meController.createLesson);
router.patch('/my-courses/:course_id/lessons/:lesson_id', authToken, authRole(['isTeacher']), meController.updateLesson);
router.delete('/my-courses/:course_id/lessons/:lesson_id', authToken, authRole(['isTeacher']), meController.deleteLesson);

// Manage My Blogs by all Users
router.get('/my-blogs', authToken, meController.findMyBlogs);
router.get('/my-blogs/:id', authToken, meController.findMyBlogById);
router.post('/my-blogs', authToken, meController.createMyBlog);
router.put('/my-blogs/:id', authToken, meController.updateMyBlog);
router.delete('/my-blogs/:id', authToken, meController.deleteMyBlog);

module.exports = router
