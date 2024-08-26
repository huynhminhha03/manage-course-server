const express = require('express');
const router = express.Router();
const userController = require('../../controllers/UserController');


router.get('/:slug', userController.findBySlug);

module.exports = router;
