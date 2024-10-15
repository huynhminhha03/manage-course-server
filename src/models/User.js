const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true, maxLength: 255 },
        password: { type: String, required: true },
        avatar: { type: String, required: false, maxLength: 255, default: null },
        desc: { type: String },
        role_id: { type: Schema.Types.ObjectId, ref: 'Role' },
        is_activated: { type: Boolean, default: true },
        slug: { type: String, slug: 'name', unique: true },
       
    },
    {
        timestamps: true,
    }
)


// Add plugins
mongoose.plugin(slug)

module.exports = mongoose.model('User', UserSchema)
