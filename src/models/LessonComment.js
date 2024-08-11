const mongoose = require('mongoose')

const Schema = mongoose.Schema

const LessonCommentSchema = new Schema(
    {
        content: { type: String, required: true },
        is_parent_comment: { type: Boolean, default: false },
        parent_comment_id: { type: Schema.Types.ObjectId, ref: 'LessonComment' },
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        is_activated: { type: Boolean, default: true },
        activated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null }, 
        activated_at: { type: Date, default: null }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('LessonComment', LessonCommentSchema)
