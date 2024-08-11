const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

const Schema = mongoose.Schema

const CourseSchema = new Schema(
    {
        title: { type: String, required: true },
        image_url: { type: String, maxLength: 255, required: true },
        desc: { type: String },
        is_activated: { type: Boolean, default: true },
        price: { type: Number },
        registered_users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        slug: { type: String, slug: 'title', unique: true },
        locked_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    }
) 

//Add plugins
mongoose.plugin(slug)

module.exports = mongoose.model('Course', CourseSchema)
