const express = require('express')
const router = express.Router()
const commentController = require('../controllers/CommentController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')

// Route cho các hàm CRUD của comment 
// Lọc comment
router.get('/', authToken, authRole(['isAdmin']), commentController.findAllComments);
router.get('/:id', authToken, authRole(['isAdmin']), commentController.findCommentById);

router.patch('/:id', authToken, authRole(['isAdmin', 'isStaff']), commentController.updateCommentByAdmin);
router.delete('/:id', authToken, authRole(['isAdmin']), commentController.deleteCommentByAdmin);

module.exports = router
