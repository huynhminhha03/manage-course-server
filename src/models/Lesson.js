const mongoose = require('mongoose')

const Schema = mongoose.Schema

const LessonSchema = new Schema(
    {
        title: { type: String, required: true },
        video_url: { type: String, required: true },
        is_deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        duration: { type: Number },
        course_id: { type: Schema.Types.ObjectId, ref: 'Course' }, 
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        is_locked: { type: Boolean, default: false },
        locked_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    }
)


module.exports = mongoose.model('Lesson', LessonSchema)
