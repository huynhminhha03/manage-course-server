// routes/lessons.js
const express = require('express')
const router = express.Router()
const lessonController = require('../../controllers/LessonController')
const commentController = require('../../controllers/CommentController')
const { authToken } = require('../../middlewares/authToken')

//Comment Lesson
router.get('/:lesson_id/comments', authToken, lessonController.getCommentsForLesson);
router.get('/:lesson_id/comments/:parent_id/replies', authToken, lessonController.getRepliesForComment);
router.post('/:lesson_id/comments/', authToken, (req, res, next) => {
    commentController.createComment(req, res, next, req.params.blog_id, 'Blog')
});

router.patch('/:lesson_id/comments/:comment_id', authToken, (req, res, next) => {
    commentController.updateComment(req, res, next, req.params.lesson_id, 'Lesson')
});

// Route cho delete comment
router.delete('/:lesson_id/comments/:comment_id', authToken, (req, res, next) => {
    commentController.deleteComment(req, res, next, req.params.lesson_id, 'Lesson')
});


module.exports = router
