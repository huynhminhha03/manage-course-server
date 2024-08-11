const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BlogSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        is_activated: { type: Boolean, default: true },
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        is_locked: { type: Boolean, default: false },
        locked_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Blog', BlogSchema)
