const express = require('express')
const router = express.Router()
const blogController = require('../controllers/BlogController')
const { authToken } = require('../middlewares/authToken')
const { authRole } = require('../middlewares/authRole')


// Giao diện phần blog của admin chỉ hiển thị các blog ra. (RPD)
// Rồi mình kiểm tra thông tin, rồi ẩn hiện hoặc xoá nó.

//Mangage blog by admin, staff
router.get('/count-all', authToken, authRole(['isAdmin', 'isStaff']), blogController.countBlogs)
router.get('/results', authToken, authRole(['isAdmin', 'isStaff']), blogController.findByNameByAdmin)
router.get('/', authToken, authRole(['isAdmin', 'isStaff']), blogController.findAllByAdmin)
router.get('/:id', authToken, authRole(['isAdmin', 'isStaff']), blogController.findOneByAdmin)
router.patch('/:id', authToken, authRole(['isAdmin', 'isStaff']), blogController.LockByAdmin)
router.delete('/:id', authToken, authRole(['isAdmin']), blogController.deleteByAdmin)


module.exports = router
