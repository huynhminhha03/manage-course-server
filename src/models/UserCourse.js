const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserCourseSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course_id: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
}, {
    timestamps: true,
})

module.exports = mongoose.model('UserCourse', UserCourseSchema)
