const express = require('express')
const router = express.Router()
const commentController = require('../../controllers/CommentController')
const { authToken } = require('../../middlewares/authToken')


router.patch('/:id', authToken, commentController.updateComment);
router.delete('/:id', authToken, commentController.deleteComment);


module.exports = router
