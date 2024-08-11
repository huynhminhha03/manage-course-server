const express = require('express')
const router = express.Router()
const blogController = require('../../controllers/BlogController')
const commentController = require('../../controllers/CommentController')
const { authToken } = require('../../middlewares/authToken')


//comments Blog
router.get('/:blog_id/comments', authToken, blogController.getParentCommentsForBlog);
router.get('/:blog_id/comments/:parent_id', authToken, blogController.getRepliesForComment);
router.patch('/:blog_id/comments', authToken, commentController.updateComment);
router.delete('/:blog_id/comments', authToken, commentController.deleteComment);

router.post('/:blog_id/comments', authToken, (req, res, next) => {
    commentController.createComment(req, res, next, req.params.blog_id, 'Blog');
});

router.get('/:id', blogController.findOne)
router.get('/', blogController.findAll)


module.exports = router
