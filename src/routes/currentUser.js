const express = require('express')
const router = express.Router()
const meController = require('../controllers/MeController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')


//Get, Patch Current User
router.get('/admin/dashboard', authToken,authRole(['isAdmin', 'isStaff']), meController.getCurrentUser);
router.patch('/current-user', authToken, meController.updateCurrentUser);
router.post('/send-notification', authToken,authRole(['isAdmin']),  meController.sendNotification);

// Manage My Blogs by all Users
router.get('/my-blogs', authToken, meController.findMyBlogs);
router.get('/my-blogs/:id', authToken, meController.findMyBlogById);
router.post('/my-blogs', authToken, meController.createMyBlog);
router.put('/my-blogs/:id', authToken, meController.updateMyBlog);
router.delete('/my-blogs/:id', authToken, meController.deleteMyBlog);

module.exports = router
