const Blog = require('../models/Blog')
const Comment = require('../models/Comment')

class BlogController {
    //[GET]/blogs/
    async findAll(req, res, next) {
        try {
            const blogs = await Blog.find({
                is_activated: true,
                is_locked: false,
            }).lean()
            res.json(blogs)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /blogs/:id
    async findOne(req, res, next) {
        try {
            const blogs = await Blog.findOne({
                _id: req.params.id,
                is_locked: false,
                is_activated: true,
            }).lean()
            res.json(blogs)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /blogs/checked-all
    async findAllByAdmin(req, res, next) {
        try {
            const filter = {}

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked
            }

            const blogs = await Blog.find(filter).lean()
            res.json(blogs)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /blogs/checked-all/:id
    async findOneByAdmin(req, res, next) {
        try {
            const blog = await Blog.findById(req.params.id).lean()

            if (!blog) {
                return res.status(404).json({ message: 'Blog không tồn tại' })
            }
            res.json(blog)
        } catch (error) {
            next(error)
        }
    }

    // [PATCH] /blogs/checked-all/:id
    async activateByAdmin(req, res, next) {
        const { is_locked } = req.body

        const updateFields = {
            is_locked,
            locked_by: req.user.id,
        }

        try {
            const blog = await Blog.findByIdAndUpdate(
                req.params.id,
                updateFields,
                {
                    new: true,
                    runValidators: true,
                }
            ).lean()
            if (!blog) {
                return res.status(404).json({ message: 'Blog không tồn tại' })
            }
            res.json(blog)
        } catch (error) {
            next(error)
        }
    }

    // [DELETE] /blogs/checked-all/:id
    async deleteByAdmin(req, res, next) {
        try {
            const blog = await Blog.findOneAndDelete({
                _id: req.params.id,
            }).lean()
            if (!blog) {
                return res.status(404).json({ message: 'Blog không tồn tại' })
            }
            res.status(204).end()
        } catch (error) {
            next(error)
        }
    }

    // GET /blogs/:blog_id/comments
    async getParentCommentsForBlog(req, res, next) {
        try {

            // Lấy tất cả comment cha (parent_id là null) cho blog cụ thể
            const parentComments = await Comment.find({
                target_id: req.params.blog_id,
                target_type: 'Blog',
                parent_id: null,
            }).lean()

            res.json(parentComments)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /blogs/:blog_id/comments/:parent_id
    async getRepliesForComment(req, res, next) {
        try {
            const { blog_id, parent_id } = req.params

            console.log(req.params)
            // Lấy tất cả comment con của một comment cha cụ thể

            const replies = await Comment.find({
                target_id: blog_id,
                target_type: 'Blog',
                parent_id,
            }).lean()

            res.json(replies)
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new BlogController()
