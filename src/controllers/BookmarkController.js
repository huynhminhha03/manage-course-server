const Bookmark = require('../models/Bookmark')

class BookmarkController {
    async toggleBookmark(req, res, next) {
        const { blog_id } = req.params
        const user_id = req.user.id
        try {
            // Tìm kiếm bookmark dựa trên user_id và blog_id
            const existingBookmark = await Bookmark.findOne({
                user_id,
                blog_id,
            })

            if (existingBookmark) {
                // Nếu bookmark đã tồn tại, xóa nó
                await Bookmark.deleteOne(existingBookmark)
                return res.json({ message: 'Bookmark removed' })
            } else {
                // Nếu bookmark chưa tồn tại, thêm mới
                const newBookmark = new Bookmark({
                    user_id,
                    blog_id,
                })
                await newBookmark.save()
                return res.json({ message: 'Bookmark added' })
            }
        } catch (error) {
            next(error)
        }
    }

    async checkBookmark(req, res, next) {
        const { blog_id } = req.params
        const user_id = req.user.id

        try {
            // Kiểm tra xem bookmark có tồn tại hay không
            const existingBookmark = await Bookmark.findOne({
                user_id,
                blog_id,
            })

            if (existingBookmark) {
                return res.json({ bookmarked: true })
            } else {
                return res.json({ bookmarked: false })
            }
        } catch (error) {
            console.error('Error checking bookmark:', error)
            next(error)
        }
    }

    // Lấy danh sách các bookmark của người dùng
    async getUserBookmarks(req, res, next) {
        const user_id = req.user.id;
        try {
            // Tạo các promises cho việc lấy danh sách bookmark và đếm số lượng bookmark
            const [bookmarks, bookmarkCount] = await Promise.all([
                Bookmark.find({ user_id }).lean().populate({
                    path: 'blog_id', 
                    select: 'title',
                    populate: {
                        path: 'creator', 
                        select: 'name' 
                    }
                }).sort({ createdAt: -1 }),
                Bookmark.countDocuments({ user_id })
            ]);
    
            // Trả về danh sách bookmark cùng số lượng
            return res.json({
                bookmarks,
                bookmarkCount
            });
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            next(error);
        }
    }
    

    // Xóa bookmark cụ thể
    async deleteBookmark(req, res, next) {
        const { id } = req.params
        try {
            // Xóa bookmark dựa trên ID
            const result = await Bookmark.findByIdAndDelete(id)
            if (result) {
                return res.json({ message: 'Bookmark deleted' })
            } else {
                return res.status(404).json({ message: 'Bookmark not found' })
            }
        } catch (error) {
            console.error('Error deleting bookmark:', error)
            next(error)
        }
    }
}

module.exports = new BookmarkController()
