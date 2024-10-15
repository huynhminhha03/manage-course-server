const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authToken } = require('../middlewares/authToken');
const { authRole } = require('../middlewares/authRole');


// Manage Users by Admin
//Quản lý Tài khoản Người dùng by Staff
router.get('/count-all', authToken, authRole(['isAdmin', 'isStaff']), userController.countUsers)
router.get('/:id/blogs',authToken, authRole(['isAdmin', 'isStaff']), userController.findAllUserBlogsByAdmin);
router.get('/:id', authToken, authRole(['isAdmin', 'isStaff']), userController.findUserByAdmin);
router.get('/', authToken, authRole(['isAdmin', 'isStaff']), userController.findAllByAdmin);
router.post('/', authToken, authRole(['isAdmin', 'isStaff']), userController.create);
router.patch('/:id', authToken,authRole(['isAdmin']), userController.updateByAdmin);
router.delete('/:id', authToken, authRole(['isAdmin']), userController.delete);

module.exports = router;
