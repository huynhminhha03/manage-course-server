const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
