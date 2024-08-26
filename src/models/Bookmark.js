const mongoose = require('mongoose')

const BookmarkSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        blog_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// Tạo index cho truy vấn nhanh
BookmarkSchema.index({ user_id: 1, blog_id: 1 }, { unique: true })

module.exports = mongoose.model('Bookmark', BookmarkSchema) 
