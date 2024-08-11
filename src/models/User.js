const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

const Schema = mongoose.Schema

const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true, maxLength: 255 },
        password: { type: String, required: true },
        avatar: { type: String, required: false, maxLength: 255 },
        desc: { type: String },
        role_id: { type: Schema.Types.ObjectId, ref: 'Role' },
        registered_courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
        is_activated: { type: Boolean, default: true },
        locked_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        slug: { type: String, slug: 'name', unique: true },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    {
        timestamps: true,
    }
)

// Thêm phương pháp setter
UserSchema.methods.setResetPasswordToken = function (token, expires) {
    this.resetPasswordToken = token
    this.resetPasswordExpires = expires
}

// Add plugins
mongoose.plugin(slug)

module.exports = mongoose.model('User', UserSchema)
