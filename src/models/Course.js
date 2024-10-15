const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CourseSchema = new Schema(
    {
        title: { type: String, required: true },
        image_url: { type: String, maxLength: 255, required: true },
        desc: { type: String },
        price: { type: Number },
        is_free: { type: Boolean, default: false },
        start_time: { type: Date , required: true},
        is_deleted: { type: Boolean, default: false },
        deletedAt: { type: Date},
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        is_locked: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Course', CourseSchema)
