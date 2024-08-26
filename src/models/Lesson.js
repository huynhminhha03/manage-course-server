const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema

const LessonSchema = new Schema(
    {
        title: { type: String,  required: true },
        video_url: { type: String,  required: true },
        is_activated: { type: Boolean, default: true },
        course_id: { type: Schema.Types.ObjectId, ref: 'Course' }, // Reference to Course
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        is_locked: { type: Boolean, default: false },
        locked_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    }
)

LessonSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Lesson', LessonSchema)
