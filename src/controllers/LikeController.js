const Like = require('../models/Like');

class LikeController {
    // [POST] {type}/:id/like/
    async like(req, res, next, target_id, target_type) {
        try {
            const user_id = req.user.id; 
            const filter = {target_id,target_type, user_id}

            const existingLike = await Like.findOne(filter);

            if (existingLike) {
                // Nếu đã like, thực hiện unlike bằng cách xóa bản ghi
                await Like.deleteOne(filter);
                return res.status(200).json({ success: true, message: `${target_type} unliked successfully. `});
            } else {
                // Nếu chưa like, thực hiện like bằng cách tạo bản ghi mới
                const newLike = new Like(filter);
                await newLike.save();
                return res.status(200).json({ success: true, message: `${target_type} liked successfully. `});
            }
        } catch (error) {
            next(error);
        }
    }

    // Hàm để lấy tất cả lượt thích cho một mục tiêu cụ thể (Blog hoặc Comment)
    async getAllLikes(req, res, next, target_id, target_type) {
        try {
            const filter = { target_id, target_type };
            const likes = await Like.find(filter).lean().populate('user_id', 'name'); // populate để lấy thông tin người dùng

            return res.status(200).json({
                count: likes.length,
            });
        } catch (error) {
            next(error);
        }
    }

    async checkLike(req, res, next, target_id, target_type) {
        try {
            const user_id = req.user.id;
            const filter = { target_id, target_type,user_id };
            const hasLiked = await Like.findOne(filter); // populate để lấy thông tin người dùng

            return res.status(200).json({
                hasLiked: !!hasLiked,
            });
        } catch (error) {
            next(error);
        }
    }


}

module.exports = new LikeController();