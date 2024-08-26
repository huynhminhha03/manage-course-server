const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CommentSchema = new Schema(
    {
        content: { type: String, required: true },
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        parent_id: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        target_id: { type: Schema.Types.ObjectId, required: true }, // ID của Blog hoặc Lesson
        target_type: { type: String, enum: ['Blog', 'Lesson'], required: true }, // Đối tượng là Blog hay Lesson
        is_activated: { type: Boolean, default: true },
        unactivated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
    }
)


// Tạo index để tối ưu truy vấn
CommentSchema.index({ target_id: 1, target_type: 1 })
//Giúp tối ưu hóa truy vấn khi bạn tìm kiếm tất cả comment của một target [Blog || Lesson].
//MongoDB sẽ sử dụng index này để nhanh chóng tìm kiếm các document có targetId và targetType tương ứng.

CommentSchema.index({ parent_id: 1 }) // Index cho parent_id
//Giúp tối ưu hóa truy vấn khi bạn tìm kiếm các comment con của một comment có parent_id bằng một giá trị cụ thể.



module.exports = mongoose.model('Comment', CommentSchema)
