const express = require('express')
const router = express.Router()
const commentController = require('../../controllers/CommentController')
const { authToken } = require('../../middlewares/authToken');
const LikeController = require('../../controllers/LikeController');


router.get('/:id/likes', (req, res, next) => {
    LikeController.getAllLikes(req, res, next, req.params.id, 'Comment');
});
router.get('/:id/check-liked', authToken, (req, res, next) => {
    LikeController.checkLike(req, res, next, req.params.id, 'Comment');
});

router.post('/:id/likes', authToken, (req, res, next) => {
    LikeController.like(req, res, next, req.params.id, 'Comment');
});

router.get('/:id', authToken, commentController.findCommentById);
router.patch('/:id', authToken, commentController.updateComment);
router.delete('/:id', authToken, commentController.deleteComment);


module.exports = router
