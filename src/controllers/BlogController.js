const Blog = require('../models/Blog')
const Comment = require('../models/Comment')
const Topic = require('../models/Topic')

class BlogController {
    //[GET]/blogs/
    async findAll(req, res, next) {
        try {
            // Lấy các tham số phân trang từ query
            const page = parseInt(req.query.page) || 1
            const limit = 10
            const skip = (page - 1) * limit

            // Tìm các blog với phân trang
            const [blogs, total] = await Promise.all([
                Blog.find({
                    is_activated: true,
                    is_locked: false,
                })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name slug',
                    }).sort({ createdAt: -1 }),
                Blog.countDocuments({
                    is_activated: true,
                    is_locked: false,
                }),
            ])

            res.json({
                data: blogs,
                total: total,
                page: page,
                limit: limit,
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /blogs/blog_id/other-blogs
    async findOtherBlogsByUser(req, res, next) {
        try {
            const { blog_id } = req.params

            const blog = await Blog.findById(blog_id).lean()

            const otherBlogs = await Blog.find({
                is_activated: true,
                is_locked: false,
                creator: blog.creator,
                _id: { $ne: blog_id },
            }).lean().sort({ createdAt: -1 })

            res.json(otherBlogs)
        } catch (error) {
            next(error)
        }
    }

        //[GET] /blogs/topics/:slug
    async findByTopicSlug(req, res, next) {
        try {
            const { topic_slug } = req.params

            let topic_id = null

            if (topic_slug) {
                const topic = await Topic.findOne({ slug: topic_slug })
                if (topic) {
                    topic_id = topic._id
                } else {
                    return res.status(400).json({ error: 'Topic not found' })
                }
            }

            // Lấy các tham số phân trang từ query
            const page = parseInt(req.query.page) || 1
            const limit = 10
            const skip = (page - 1) * limit

            // Tìm các blog với phân trang
            const [blogs, total] = await Promise.all([
                Blog.find({
                    topic_id,
                    is_activated: true,
                    is_locked: false,
                })
                    .skip(skip)
                    .limit(limit)
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name slug avatar',
                    }).sort({ createdAt: -1 }),
                Blog.countDocuments({
                    topic_id,
                    is_activated: true,
                    is_locked: false,
                }),
            ])

            res.json({
                data: blogs,
                total: total,
                page: page,
                limit: limit,
            })
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
            })
                .lean()
                .populate({
                    path: 'creator',
                    select: 'name slug avatar desc',
                })
            res.json(blogs)
        } catch (error) {
            next(error)
        }
    }

    // [GET] /blogs
    async findAllByAdmin(req, res, next) {
        try {
            const filter = {}

            if (req.query.is_locked !== undefined) {
                filter.is_locked = req.query.is_locked
            }

            // Lấy các tham số phân trang từ query
            const page = parseInt(req.query.page) || 1
            const limit = parseInt(req.query.limit) || 10
            const skip = (page - 1) * limit

            const [blogs, total] = await Promise.all([
                Blog.find(filter).skip(skip).limit(limit).lean().sort({ createdAt: -1 }),
                Blog.countDocuments(filter),
            ])

            res.json({
                data: blogs,
                total: total,
                page: page,
                limit: limit,
            })
        } catch (error) {
            next(error)
        }
    }

    // [GET] /blogs/:id
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

    // [PATCH] /blogs/:id
    async LockByAdmin(req, res, next) {
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

    // [DELETE] /blogs/:id
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
    async getCommentsAndCountForBlog(req, res, next) {
        try {
            const blog_id = req.params.blog_id

            // Chạy cả hai hàm bất đồng bộ cùng lúc
            const [parent_comments, total_comments] = await Promise.all([
                Comment.find({
                    target_id: blog_id,
                    target_type: 'Blog',
                    parent_id: null,
                })
                    .lean()
                    .populate({
                        path: 'creator',
                        select: 'name slug avatar',
                    })
                    .sort({ createdAt: -1 }),
                Comment.countDocuments({
                    target_id: blog_id,
                    target_type: 'Blog',
                }),
            ])

            // Trả về kết quả
            res.json({
                parent_comments,
                total_comments,
            })
        } catch (error) {
            next(error)
        }
    }

    // GET /blogs/:blog_id/count-comments
    async countAllCommentsBlog(req, res, next) {
        try {
            const blog_id = req.params.blog_id

            const total_comments = await Comment.countDocuments({
                target_id: blog_id,
                target_type: 'Blog',
            })

            res.json({ total_comments })
        } catch (error) {
            console.log(error)
        }
    }

    // [GET] /blogs/:blog_id/comments/:parent_id
    async getRepliesForComment(req, res, next) {
        try {
            const { blog_id, parent_id } = req.params

            // Lấy tất cả comment con của một comment cha cụ thể
            const replies = await Comment.find({
                target_id: blog_id,
                target_type: 'Blog',
                parent_id,
            })
                .lean()
                .populate({
                    path: 'creator',
                    select: 'name slug avatar',
                })
                .sort({ createdAt: -1 })

            res.json(replies)
        } catch (error) {
            next(error)
        }
    }

    async countAllRepliesComment(req, res, next) {
        try {
            const { blog_id, parent_id } = req.params

            // Lấy tất cả comment con của một comment cha cụ thể
            const count = await Comment.countDocuments({
                target_id: blog_id,
                target_type: 'Blog',
                parent_id,
            }).lean()

            res.json({ count })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new BlogController()
