const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BlogSchema = new Schema(
    {
        title: { type: String, required: true },
        desc: { type: String, default: null },
        content: { type: String, required: true },
        is_deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
        is_locked: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Blog', BlogSchema)
