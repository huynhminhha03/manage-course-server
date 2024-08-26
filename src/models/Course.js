const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

const Schema = mongoose.Schema

const CourseSchema = new Schema(
    {
        title: { type: String, required: true },
        image_url: { type: String, maxLength: 255, required: true },
        desc: { type: String },
        start_time: { type: Date },
        is_activated: { type: Boolean, default: true },
        price: { type: Number },
        isFree: { type: Boolean, default: false },
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        slug: { type: String, slug: 'title', unique: true },
        is_locked: { type: Boolean, default: false },
        locked_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    }
)

//Add plugins
mongoose.plugin(slug)

module.exports = mongoose.model('Course', CourseSchema)
