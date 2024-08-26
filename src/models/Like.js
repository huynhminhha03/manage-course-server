const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LikeSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    target_id: { type: Schema.Types.ObjectId, required: true }, // ID của Blog hoặc Comment
    target_type: { type: String, enum: ['Blog', 'Comment'], required: true }, 
}, {
    timestamps: true,
});

// Đánh index cho cặp target_id và target_type để tăng tốc độ truy vấn, tìm blog có bao nhiêu like
LikeSchema.index({ target_id: 1, target_type: 1 });

// Đánh index duy nhất để tránh trùng lặp likes từ cùng một người dùng
LikeSchema.index({ user_id: 1, target_id: 1, target_type: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
