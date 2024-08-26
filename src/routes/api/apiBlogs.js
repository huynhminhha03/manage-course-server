const express = require('express')
const router = express.Router()
const blogController = require('../../controllers/BlogController')
const commentController = require('../../controllers/CommentController')
const LikeController = require('../../controllers/LikeController')
const BookmarkController = require('../../controllers/BookmarkController')
const { authToken } = require('../../middlewares/authToken')


//comments Blog
router.get('/topics/:topic_slug', blogController.findByTopicSlug)
router.get('/:blog_id/others', blogController.findOtherBlogsByUser);
router.post('/:blog_id/bookmarks', authToken, BookmarkController.toggleBookmark);
router.get('/:blog_id/bookmarks/checked',authToken, BookmarkController.checkBookmark);
router.get('/:blog_id/comments', blogController.getCommentsAndCountForBlog);
router.get('/:blog_id/count-comments', blogController.countAllCommentsBlog);
router.get('/:blog_id/comments/:parent_id', blogController.getRepliesForComment);
router.get('/:blog_id/comments/:parent_id/count', blogController.countAllRepliesComment);
router.patch('/:blog_id/comments', authToken, commentController.updateComment);
router.delete('/:blog_id/comments', authToken, commentController.deleteComment);

router.post('/:blog_id/comments', authToken, (req, res, next) => {
    commentController.createComment(req, res, next, req.params.blog_id, 'Blog');
});
router.post('/:id/likes', authToken, (req, res, next) => {
    LikeController.like(req, res, next, req.params.id, 'Blog');
});

router.get('/:id/likes/checked', authToken, (req, res, next) => {
     LikeController.checkLike(req, res, next, req.params.id, 'Blog');
});

router.get('/:id/likes', (req, res, next) => {
    LikeController.getAllLikes(req, res, next, req.params.id, 'Blog');
});



router.get('/:id', blogController.findOne)
router.get('/', blogController.findAll)


module.exports = router
