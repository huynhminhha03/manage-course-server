const Blog = require('../models/Blog');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Course = require('../models/Course');

async function unactivateObject(req, res, next) {
    try {
        const { object_type, object_id } = req.params; 
        const admin_id = req.user.id; 

        let model;

        switch (object_type) {
            case 'blog':
                model = Blog;
                break;
            case 'user':
                model = User;
                break;
            case 'comment':
                model = Comment;
                break;
            case 'course':
                model = Course;
                break;
            default:
                return res.status(400).json({ message: 'Invalid object type' });
        }

        const updatedObject = await model.findByIdAndUpdate(
            object_id,
            {
                is_activated: false,
                activated_by: admin_id, 
                activated_at: new Date() 
            },
            { new: true }
        );

        if (!updatedObject) {
            return res.status(404).json({ message: `${object_type.charAt(0).toUpperCase() + object_type.slice(1)} not found` });
        }

        res.json(updatedObject);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    unactivateObject
};
