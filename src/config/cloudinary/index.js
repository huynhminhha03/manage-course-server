const multer = require('multer')
const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')
const { default: getPublicIdFromUrl } = require('../../utils/cloudinaryUtils')
require('dotenv').config()

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

// Cấu hình lưu trữ tạm thời trên disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase()

        if (
            ext === '.jpg' ||
            ext === '.jpeg' ||
            ext === '.png' ||
            ext === '.gif'
        ) {
            cb(null, 'uploads/images/') // Thư mục lưu trữ hình ảnh
        } else if (
            ext === '.mp4' ||
            ext === '.avi' ||
            ext === '.mov' ||
            ext === '.mkv'
        ) {
            cb(null, 'uploads/videos/') // Thư mục lưu trữ video
        } else {
            cb(new Error('File type not supported'), null) // Loại file không hỗ trợ
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Tạo tên file duy nhất
    },
})

// Khởi tạo multer với cấu hình lưu trữ
const upload = multer({ storage: storage })

// Hàm upload hình ảnh hoặc video lên Cloudinary từ file đã lưu trên disk
async function uploadMedia(filePath, publicId) {
    try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
        })

        // Xóa file tạm sau khi upload lên Cloudinary
        fs.unlinkSync(filePath)

        return uploadResult
    } catch (error) {
        // Nếu có lỗi, xóa file tạm
        fs.unlinkSync(filePath)
        throw error
    }
}

// Hàm lấy URL tối ưu hóa của hình ảnh hoặc video
function getOptimizedUrl(publicId) {
    return cloudinary.url(publicId, {
        fetch_format: 'auto',
        quality: 'auto',
    })
}

// Hàm xóa tệp trên Cloudinary
async function deleteMedia(url) {
    try {
        const publicId = getPublicIdFromUrl(url)
        const result = await cloudinary.uploader.destroy(publicId)
        return result
    } catch (error) {
        throw error
    }
}

module.exports = {
    upload,
    uploadMedia,
    getOptimizedUrl,
    deleteMedia,
}
