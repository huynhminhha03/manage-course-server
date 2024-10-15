const Notification = require('../models/Notification');
const User = require('../models/User');
const connectedUsers = require('../sockets').connectedUsers;

async function notifyUsersAboutNewLesson(lesson, course) {
    try {
        const users = await User.find({ enrolledCourses: course._id });

        for (const user of users) {
            const notification = new Notification({
                title: `New lesson added to ${course.title}`,
                message: `Lesson "${lesson.title}" has been added to the course.`,
                user_id: user._id,
            });

            await notification.save();

            const message = {
                title: notification.title,
                message: notification.message,
                user_id: user._id,
            };

            if (connectedUsers[user._id]) {
                connectedUsers[user._id].send(JSON.stringify(message));
            }
        }
    } catch (error) {
        console.error('Error notifying users:', error);
    }
}

const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy ID người dùng từ token sau khi xác thực

        // Lấy tất cả thông báo của người dùng từ MongoDB
        const notifications = await Notification.find({ user_id: userId }).sort({ createdAt: -1 });

        // Trả về danh sách thông báo
        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
        });
    }
};

module.exports = { notifyUsersAboutNewLesson, getUserNotifications };
